// app/api/stripe/webhook/route.js
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { userSubscriptionsDb } from "@/lib/database";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Extract metadata
      const userId = parseInt(session.metadata.user_id);
      const packageId = parseInt(session.metadata.package_id);
      const displayCurrency = session.metadata.display_currency || "PKR";
      const displayPrice = parseFloat(session.metadata.display_price);
      const chargedPriceUSD = parseFloat(session.metadata.charged_price_usd);
      const exchangeRate = parseFloat(session.metadata.exchange_rate);

      console.log(
        "Processing payment for user:",
        userId,
        "package:",
        packageId
      );

      // Assign package to user
      await userSubscriptionsDb.purchasePackage(userId, packageId);

      // Record payment in payment_history
      await sql`
        INSERT INTO payment_history (
          user_id,
          package_id,
          amount,
          status,
          stripe_session_id,
          stripe_payment_intent_id,
          original_amount,
          charged_amount,
          exchange_rate,
          display_currency
        ) VALUES (
          ${userId},
          ${packageId},
          ${chargedPriceUSD},
          'completed',
          ${session.id},
          ${session.payment_intent},
          ${displayPrice},
          ${chargedPriceUSD},
          ${exchangeRate},
          ${displayCurrency}
        )
      `;

      console.log("✅ Payment recorded successfully");
      console.log(`   Display: ${displayCurrency} ${displayPrice}`);
      console.log(`   Charged: USD ${chargedPriceUSD}`);
      console.log(`   Exchange Rate: ${exchangeRate}`);
    }

    // Handle payment_intent.payment_failed event
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      console.error("Payment failed:", paymentIntent.id);

      // Optionally record failed payment
      // await recordFailedPayment(paymentIntent);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
