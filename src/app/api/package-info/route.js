import { NextResponse } from "next/server";
import { sessionDb } from "@/lib/database";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function GET(request) {
  try {
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

    // Get user's package info
    const result = await sql`
      SELECT 
        stripe_customer_id,
        generations_remaining,
        sends_per_email,
        current_package,
        package_purchased_at,
        free_period_end
      FROM users
      WHERE id = ${user.id}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ...result[0],
    });
  } catch (error) {
    console.error("Error fetching package info:", error);
    return NextResponse.json(
      { error: "Failed to fetch package info" },
      { status: 500 }
    );
  }
}
