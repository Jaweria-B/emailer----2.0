import { NextResponse } from "next/server";
import { stripe, verifyWebhookSignature } from "@/lib/stripe";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Critical for Next.js to handle raw body
export const runtime = "nodejs";

/**
 * Stripe Webhook Handler - December 2025 Version
 * Handles checkout.session.completed events
 */
export async function POST(request) {
  try {
    // 1. Get raw body (required for signature verification)
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("❌ Missing Stripe signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // 2. Verify webhook signature (CRITICAL for security)
    let event;
    try {
      event = verifyWebhookSignature(body, signature);
      console.log("✅ Webhook signature verified");
      console.log("📦 Event type:", event.type);
    } catch (err) {
      console.error("⚠️ Signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 3. Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log("💳 Processing checkout:", session.id);

      // Extract customer information
      const customerEmail =
        session.customer_details?.email || session.customer_email;
      const customerId = session.customer;

      if (!customerEmail) {
        console.error("❌ No customer email found in session");
        return NextResponse.json(
          { error: "Missing customer email" },
          { status: 400 }
        );
      }

      // 4. Fetch line items with expanded product details (December 2025 method)
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        {
          expand: ["data.price.product"],
          limit: 10, // December 2025: explicit limit recommended
        }
      );

      if (!lineItems.data?.length) {
        console.error("❌ No line items in session");
        return NextResponse.json(
          { error: "No items purchased" },
          { status: 400 }
        );
      }

      // 5. Get product metadata
      const lineItem = lineItems.data[0];
      const product =
        typeof lineItem.price.product === "string"
          ? await stripe.products.retrieve(lineItem.price.product)
          : lineItem.price.product;

      // Extract metadata
      const { generations, sends_per_email, package_name } =
        product.metadata || {};

      // Validate metadata
      if (!generations || !sends_per_email || !package_name) {
        console.error("❌ Invalid product metadata:", product.metadata);
        return NextResponse.json(
          { error: "Product missing required metadata" },
          { status: 400 }
        );
      }

      console.log(`✅ Package purchased: ${package_name}`);
      console.log(`   Customer: ${customerEmail}`);
      console.log(`   Generations: ${generations}`);
      console.log(`   Sends per email: ${sends_per_email}`);

      // 6. Update user in database
      const result = await sql`
        UPDATE users 
        SET 
          stripe_customer_id = ${customerId},
          generations_remaining = ${parseInt(generations)},
          sends_per_email = ${parseInt(sends_per_email)},
          current_package = ${package_name},
          package_purchased_at = NOW()
        WHERE email = ${customerEmail}
        RETURNING id, name, email, current_package
      `;

      if (result.length === 0) {
        console.error("❌ User not found:", customerEmail);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const user = result[0];
      console.log(`✅ Updated user ${user.id}:`, {
        name: user.name,
        package: user.current_package,
      });

      // 7. Optional: Record in purchase history (if you want)
      try {
        await sql`
          INSERT INTO package_purchase_history (
            user_id, 
            stripe_session_id, 
            stripe_customer_id,
            package_name, 
            generations, 
            sends_per_email,
            amount_paid,
            currency,
            purchased_at
          ) VALUES (
            ${user.id},
            ${session.id},
            ${customerId},
            ${package_name},
            ${parseInt(generations)},
            ${parseInt(sends_per_email)},
            ${(session.amount_total / 100).toFixed(2)},
            ${session.currency.toUpperCase()},
            NOW()
          )
          ON CONFLICT (stripe_session_id) DO NOTHING
        `;
        console.log("✅ Purchase history recorded");
      } catch (historyError) {
        // Non-critical error, don't fail the webhook
        console.warn(
          "⚠️ Could not record purchase history:",
          historyError.message
        );
      }

      return NextResponse.json({
        received: true,
        user_id: user.id,
        package: package_name,
      });
    }

    // Handle other event types (log for debugging)
    console.log("ℹ️ Unhandled event type:", event.type);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
