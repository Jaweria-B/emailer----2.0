// app/api/region/detect/route.js
import { NextResponse } from "next/server";
import { sessionDb } from "@/lib/database";

export const EXCHANGE_RATE = 280;

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnecting = request.headers.get("cf-connecting-ip");

  if (cfConnecting) return cfConnecting;
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIp) return realIp;
  return null;
}

async function detectCountryFromIp(ip) {
  if (
    !ip ||
    ip === "127.0.0.1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.")
  ) {
    return null;
  }

  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,countryCode`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(3000),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();

    if (data.status === "success") {
      console.log(`IP ${ip} detected as ${data.countryCode}`);
      return data.countryCode;
    }
  } catch (error) {
    console.error("IP geolocation failed:", error.message);
  }

  return null;
}

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value;
    if (sessionToken) {
      try {
        const user = await sessionDb.findValid(sessionToken);
        if (user && user.preferred_currency) {
          return NextResponse.json({
            success: true,
            currency: user.preferred_currency,
            region: user.preferred_currency === "PKR" ? "PK" : "GLOBAL",
            exchange_rate: EXCHANGE_RATE,
            source: "user_override",
          });
        }
      } catch (e) {
        console.error("DB error:", e);
      }
    }

    const cookieCurrency = request.cookies.get("preferred_currency")?.value;
    if (cookieCurrency && ["PKR", "USD"].includes(cookieCurrency)) {
      return NextResponse.json({
        success: true,
        currency: cookieCurrency,
        region: cookieCurrency === "PKR" ? "PK" : "GLOBAL",
        exchange_rate: EXCHANGE_RATE,
        source: "cookie_override",
      });
    }

    const clientIp = getClientIp(request);
    console.log("Client IP:", clientIp);

    if (clientIp) {
      const countryCode = await detectCountryFromIp(clientIp);

      if (countryCode === "PK") {
        return NextResponse.json({
          success: true,
          currency: "PKR",
          region: "PK",
          exchange_rate: EXCHANGE_RATE,
          source: "ip_detection",
        });
      }
    }

    return NextResponse.json({
      success: true,
      currency: "USD",
      region: "GLOBAL",
      exchange_rate: EXCHANGE_RATE,
      source: "default",
    });
  } catch (error) {
    console.error("Region detection error:", error);
    return NextResponse.json({
      success: true,
      currency: "USD",
      region: "GLOBAL",
      exchange_rate: EXCHANGE_RATE,
      source: "error_fallback",
    });
  }
}

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

    response.cookies.set("preferred_currency", currency, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      path: "/",
    });

    const sessionToken = request.cookies.get("session_token")?.value;
    if (sessionToken) {
      try {
        const user = await sessionDb.findValid(sessionToken);
        if (user) {
          const { neon } = await import("@neondatabase/serverless");
          const sql = neon(process.env.DATABASE_URL);
          await sql`UPDATE users SET preferred_currency = ${currency} WHERE id = ${user.id}`;
        }
      } catch (e) {
        console.error("DB save error:", e);
      }
    }

    return response;
  } catch (error) {
    console.error("Error saving preference:", error);
    return NextResponse.json(
      { error: "Failed to save preference" },
      { status: 500 }
    );
  }
}
