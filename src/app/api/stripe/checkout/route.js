// app/api/stripe/create-checkout/route.js
import { NextResponse } from "next/server";
import { sessionDb, userSubscriptionsDb, packagesDb } from "@/lib/database";
import { stripe } from "@/lib/stripe";

export async function POST(request) {
  try {
    // 1. Authenticate user
    const sessionToken = request.cookies.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await sessionDb.findValid(sessionToken);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // 2. Validate Pro plan requirement
    const subscription = await userSubscriptionsDb.getCurrent(user.id);

    if (!subscription || subscription.plan_name !== "Pro") {
      return NextResponse.json(
        { error: "You must be on Pro plan to purchase packages" },
        { status: 403 }
      );
    }

    // 3. Get package and display currency from request
    const { package_id, display_currency = "PKR" } = await request.json();

    if (!package_id) {
      return NextResponse.json(
        { error: "package_id is required" },
        { status: 400 }
      );
    }

    const pkg = await packagesDb.getById(package_id);

    if (!pkg || !pkg.is_active) {
      return NextResponse.json(
        { error: "Invalid or inactive package" },
        { status: 404 }
      );
    }

    // Validate package prices exist
    if (!pkg.price_pkr || !pkg.price_usd) {
      console.error("Package missing prices:", pkg);
      return NextResponse.json(
        { error: "Package pricing not configured. Please contact support." },
        { status: 500 }
      );
    }

    // 4. Get or create Stripe customer
    let stripeCustomerId = user.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          user_id: user.id.toString(),
          preferred_currency: display_currency,
        },
      });

      stripeCustomerId = customer.id;

      // Save Stripe customer ID to database
      await userDb.updateStripeCustomer(user.id, stripeCustomerId);
    }

    // 5. Calculate prices based on display currency
    // Convert database values to numbers (they might be strings)
    let chargedAmountUSD;
    let displayPrice;
    let exchangeRate;

    if (display_currency === "PKR") {
      // PKR User: Convert PKR to USD for charging
      displayPrice = parseFloat(pkg.price_pkr);
      exchangeRate = 280; // Fixed exchange rate

      // Validate parsed value
      if (isNaN(displayPrice) || displayPrice <= 0) {
        console.error("Invalid PKR price:", pkg.price_pkr);
        return NextResponse.json(
          { error: "Invalid package pricing. Please contact support." },
          { status: 500 }
        );
      }

      chargedAmountUSD = displayPrice / exchangeRate;

      console.log("💰 PKR User Checkout:");
      console.log(`   Display Price: PKR ${displayPrice}`);
      console.log(`   Exchange Rate: 1 USD = ${exchangeRate} PKR`);
      console.log(`   Charged Amount: USD ${chargedAmountUSD.toFixed(2)}`);
    } else {
      // USD User: Charge USD directly
      displayPrice = parseFloat(pkg.price_usd);
      exchangeRate = 1;

      // Validate parsed value
      if (isNaN(displayPrice) || displayPrice <= 0) {
        console.error("Invalid USD price:", pkg.price_usd);
        return NextResponse.json(
          { error: "Invalid package pricing. Please contact support." },
          { status: 500 }
        );
      }

      chargedAmountUSD = displayPrice;

      console.log("💰 USD User Checkout:");
      console.log(`   Display Price: USD ${displayPrice}`);
      console.log(`   Charged Amount: USD ${chargedAmountUSD.toFixed(2)}`);
    }

    const stripePriceInCents = Math.round(chargedAmountUSD * 100); // Convert to cents

    console.log(`   Stripe Amount: ${stripePriceInCents} cents`);

    // Validate minimum Stripe amount (50 cents)
    if (stripePriceInCents < 50) {
      return NextResponse.json(
        { error: "Amount too small. Minimum charge is $0.50 USD" },
        { status: 400 }
      );
    }

    // 6. Create Stripe Checkout Session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd", // Always USD for Stripe
            product_data: {
              name: `${pkg.name} Package`,
              description:
                display_currency === "PKR"
                  ? `${pkg.credits} email generations, ${
                      pkg.sends_per_email
                    } sends per email (PKR ${displayPrice.toFixed(
                      2
                    )} = $${chargedAmountUSD.toFixed(2)} USD)`
                  : `${pkg.credits} email generations, ${pkg.sends_per_email} sends per email`,
            },
            unit_amount: stripePriceInCents, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
      metadata: {
        user_id: user.id.toString(),
        package_id: pkg.id.toString(),
        display_currency: display_currency,
        display_price: displayPrice.toString(),
        charged_price_usd: chargedAmountUSD.toFixed(2),
        exchange_rate: exchangeRate.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    return NextResponse.json({
      success: true,
      session_id: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session", details: error.message },
      { status: 500 }
    );
  }
}
