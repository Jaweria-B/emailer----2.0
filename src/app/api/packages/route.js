// app/api/packages/route.js
import { NextResponse } from "next/server";
import { packagesDb } from "@/lib/database";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get("currency") || "PKR";

    // Validate currency
    if (!["PKR", "USD"].includes(currency)) {
      return NextResponse.json(
        { error: "Invalid currency. Must be PKR or USD" },
        { status: 400 }
      );
    }

    // Get all active packages
    const allPackages = await packagesDb.getAll();

    // Filter active packages and map to include appropriate price
    const packages = allPackages
      .filter((pkg) => pkg.is_active && pkg.name !== "Business") // Exclude Business
      .map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        credits: pkg.credits,
        sends_per_email: pkg.sends_per_email,
        price: currency === "PKR" ? pkg.price_pkr : pkg.price_usd,
        currency: currency,
        description: pkg.description,
      }));

    return NextResponse.json({
      success: true,
      packages: packages,
      currency: currency,
      exchange_rate: 280, // Fixed exchange rate PKR to USD
    });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}
