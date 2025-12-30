// app/api/region/detect/route.js
import { NextResponse } from "next/server";
import { sessionDb } from "@/lib/database";

// Fixed exchange rate: 1 USD = 280 PKR
export const EXCHANGE_RATE = 280;

export async function GET(request) {
  try {
    // Priority 1: Check logged-in user's saved preference
    const sessionToken = request.cookies.get("session_token")?.value;
    if (sessionToken) {
      const user = await sessionDb.findValid(sessionToken);
      if (user && user.preferred_currency) {
        return NextResponse.json({
          success: true,
          currency: user.preferred_currency,
          region: user.preferred_currency === "PKR" ? "PK" : "GLOBAL",
          exchange_rate: EXCHANGE_RATE,
          source: "user_preference",
        });
      }
    }

    // Priority 2: Check cookie for anonymous users
    const preferredCurrency = request.cookies.get("preferred_currency")?.value;
    if (preferredCurrency) {
      return NextResponse.json({
        success: true,
        currency: preferredCurrency,
        region: preferredCurrency === "PKR" ? "PK" : "GLOBAL",
        exchange_rate: EXCHANGE_RATE,
        source: "cookie",
      });
    }

    // Priority 3: Try to detect from Cloudflare headers (if using Cloudflare)
    const cfCountry = request.headers.get("cf-ipcountry");
    if (cfCountry === "PK") {
      return NextResponse.json({
        success: true,
        currency: "PKR",
        region: "PK",
        exchange_rate: EXCHANGE_RATE,
        source: "ip_detection",
      });
    }

    // Default: Show USD for global users
    return NextResponse.json({
      success: true,
      currency: "USD",
      region: "GLOBAL",
      exchange_rate: EXCHANGE_RATE,
      source: "default",
    });
  } catch (error) {
    console.error("Region detection error:", error);
    // Fallback to USD on error
    return NextResponse.json({
      success: true,
      currency: "USD",
      region: "GLOBAL",
      exchange_rate: EXCHANGE_RATE,
      source: "error_fallback",
    });
  }
}

// POST endpoint to save user's currency preference
export async function POST(request) {
  try {
    const { currency } = await request.json();

    if (!currency || !["PKR", "USD"].includes(currency)) {
      return NextResponse.json(
        { error: "Invalid currency. Must be PKR or USD" },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      currency,
      region: currency === "PKR" ? "PK" : "GLOBAL",
      exchange_rate: EXCHANGE_RATE,
      message: "Currency preference saved",
    });

    // Save in cookie for future visits
    response.cookies.set("preferred_currency", currency, {
      httpOnly: false, // Allow client-side access for immediate updates
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
      path: "/",
    });

    // If user is logged in, save to database
    const sessionToken = request.cookies.get("session_token")?.value;
    if (sessionToken) {
      const user = await sessionDb.findValid(sessionToken);
      if (user) {
        // Update user's preferred currency in database
        const { neon } = await import("@neondatabase/serverless");
        const sql = neon(process.env.DATABASE_URL);

        await sql`
          UPDATE users 
          SET preferred_currency = ${currency}
          WHERE id = ${user.id}
        `;
      }
    }

    return response;
  } catch (error) {
    console.error("Error saving currency preference:", error);
    return NextResponse.json(
      { error: "Failed to save currency preference" },
      { status: 500 }
    );
  }
}
