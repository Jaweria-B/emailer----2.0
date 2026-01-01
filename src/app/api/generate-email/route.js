// app/api/generate-email/route.js - UPDATED FOR STRIPE INTEGRATION
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { EmailGenerationService } from "@/lib/ai-services";
import { AI_PROVIDERS } from "@/lib/ai-config";
import { sessionDb, anonymousDevicesDb } from "@/lib/database";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const cookieStore = request.cookies;
    const sessionToken = cookieStore.get("session_token")?.value;
    let deviceId = cookieStore.get("device_id")?.value;

    let user = null;
    let hasBranding = true; // Default to true for anonymous users

    if (sessionToken) {
      user = await sessionDb.findValid(sessionToken);
    }

    // ============================================
    // AUTHENTICATED USER - CHECK PACKAGE LIMITS
    // ============================================
    if (user) {
      // Fetch user's package data from users table
      const userData = await sql`
        SELECT 
          id,
          email,
          generations_remaining,
          sends_per_email,
          current_package,
          free_period_start,
          free_period_end
        FROM users
        WHERE id = ${user.id}
      `;

      if (userData.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const userLimits = userData[0];

      // Check if free tier period expired and reset if needed
      const now = new Date();
      const periodEnd = new Date(userLimits.free_period_end);

      if (!userLimits.current_package && periodEnd < now) {
        console.log(`🔄 Resetting free tier for user ${user.id}`);

        // Reset free tier limits
        await sql`
          UPDATE users
          SET 
            generations_remaining = 5,
            free_period_start = NOW(),
            free_period_end = NOW() + INTERVAL '30 days'
          WHERE id = ${user.id}
        `;

        // Update local variable
        userLimits.generations_remaining = 5;
        console.log(`✅ Free tier reset complete for user ${user.id}`);
      }

      // Check if user has generations remaining
      if (userLimits.generations_remaining <= 0) {
        const errorMessage = userLimits.current_package
          ? `Your ${userLimits.current_package} package has been fully used. Please purchase a new package to continue.`
          : "You have used all 5 free generations this month. Please purchase a package to continue.";

        console.log(`❌ Generation limit reached for user ${user.id}`);

        return NextResponse.json(
          {
            error: errorMessage,
            remaining: 0,
            current_package: userLimits.current_package,
            package_required: true,
            free_tier_resets: userLimits.current_package
              ? null
              : userLimits.free_period_end,
          },
          { status: 403 }
        );
      }

      // Set branding: Only free users get branding
      hasBranding = !userLimits.current_package;

      console.log(
        `✅ User ${user.id} can generate (${userLimits.generations_remaining} remaining, branding: ${hasBranding})`
      );
    }
    // ============================================
    // ANONYMOUS USER - CHECK DEVICE ID
    // ============================================
    else {
      // For anonymous users, check device ID
      if (!deviceId) {
        deviceId = uuidv4();
      }

      const existingDevice = await anonymousDevicesDb.findByDeviceId(deviceId);

      if (existingDevice) {
        return NextResponse.json(
          {
            error:
              "You have already generated your free email. Please sign in to get 5 free generations per month.",
            sign_in_required: true,
          },
          { status: 403 }
        );
      }

      console.log(`✅ Anonymous user can generate (device: ${deviceId})`);
    }

    // ============================================
    // GENERATE EMAIL WITH AI
    // ============================================

    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY not configured");
      return NextResponse.json(
        {
          error:
            "Email generation service is not configured. Please contact support.",
        },
        { status: 500 }
      );
    }

    // Parse request body
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        {
          error:
            "Email content is required. Please describe what you want to say.",
        },
        { status: 400 }
      );
    }

    // Create email generation service
    const emailService = new EmailGenerationService(
      AI_PROVIDERS.GEMINI,
      apiKey
    );

    // Generate email with retry logic
    let result;
    try {
      result = await emailService.generateEmail(prompt);
    } catch (generationError) {
      console.error("❌ Email generation failed:", generationError);

      // Handle specific error types
      if (
        generationError.message.includes("503") ||
        generationError.message.includes("overloaded")
      ) {
        return NextResponse.json(
          {
            error:
              "Our AI service is experiencing high demand. Please try again in a moment.",
            retry_suggested: true,
            error_type: "service_overload",
          },
          { status: 503 }
        );
      }

      if (
        generationError.message.includes("429") ||
        generationError.message.includes("rate limit")
      ) {
        return NextResponse.json(
          {
            error: "Rate limit reached. Please wait 30 seconds and try again.",
            retry_suggested: true,
            error_type: "rate_limit",
          },
          { status: 429 }
        );
      }

      if (generationError.message.includes("timeout")) {
        return NextResponse.json(
          {
            error: "Request timeout. Please try again.",
            retry_suggested: true,
            error_type: "timeout",
          },
          { status: 504 }
        );
      }

      if (
        generationError.message.includes("401") ||
        generationError.message.includes("Authentication")
      ) {
        console.error("❌ API authentication failed - check GEMINI_API_KEY");
        return NextResponse.json(
          {
            error:
              "Configuration issue with email service. Please contact support.",
            error_type: "auth_error",
          },
          { status: 500 }
        );
      }

      if (
        generationError.message.includes("400") ||
        generationError.message.includes("Invalid request")
      ) {
        return NextResponse.json(
          {
            error: "Invalid request. Please check your input and try again.",
            error_type: "invalid_request",
          },
          { status: 400 }
        );
      }

      // Generic generation error
      return NextResponse.json(
        {
          error: "Failed to generate email. Please try again.",
          retry_suggested: true,
          error_type: "generation_failed",
        },
        { status: 500 }
      );
    }

    // Validate AI result
    if (!result || !result.subject || !result.body) {
      console.error("❌ Invalid AI result:", result);
      return NextResponse.json(
        {
          error: "AI generated incomplete email. Please try again.",
          retry_suggested: true,
          error_type: "invalid_response",
        },
        { status: 500 }
      );
    }

    // ============================================
    // ADD BRANDING (for free users only)
    // ============================================
    if (hasBranding) {
      result.body = result.body + "\n\n---\nPowered by OpenPromote ⚡";
    }

    // ============================================
    // TRACK USAGE
    // ============================================

    if (user) {
      // Decrement generations_remaining for authenticated users
      try {
        const updateResult = await sql`
          UPDATE users
          SET generations_remaining = GREATEST(generations_remaining - 1, 0)
          WHERE id = ${user.id}
          RETURNING generations_remaining, current_package
        `;

        const updated = updateResult[0];
        console.log(
          `✅ Usage tracked for user ${user.id}: ${updated.generations_remaining} remaining`
        );

        // Warn if running low
        if (updated.generations_remaining <= 2) {
          console.log(
            `⚠️ User ${user.id} has only ${updated.generations_remaining} generations left`
          );
        }
      } catch (trackingError) {
        console.error("⚠️ Failed to track usage:", trackingError);
        // Don't fail the request if tracking fails
      }
    } else {
      // Track anonymous device
      try {
        await anonymousDevicesDb.create(deviceId);
        console.log(`✅ Anonymous device tracked: ${deviceId}`);
      } catch (deviceError) {
        console.error("⚠️ Failed to track anonymous device:", deviceError);
        // Don't fail the request if tracking fails
      }
    }

    // ============================================
    // RETURN SUCCESS RESPONSE
    // ============================================

    const response = NextResponse.json({
      subject: result.subject,
      body: result.body,
      has_branding: hasBranding,
      success: true,
    });

    // Set device cookie for anonymous users
    if (!user && !cookieStore.get("device_id")?.value) {
      response.cookies.set("device_id", deviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
        sameSite: "lax",
        path: "/",
      });
    }

    console.log(
      `✅ Email generated successfully ${
        user ? `for user ${user.id}` : "for anonymous user"
      }`
    );
    return response;
  } catch (error) {
    console.error("❌ Unexpected error:", error);

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: "Invalid request format.",
          error_type: "parse_error",
        },
        { status: 400 }
      );
    }

    // Handle database errors
    if (error.message?.includes("database")) {
      return NextResponse.json(
        {
          error: "Temporary database issue. Please try again.",
          retry_suggested: true,
          error_type: "database_error",
        },
        { status: 503 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error:
          "Unexpected error occurred. Please try again or contact support.",
        retry_suggested: true,
        error_type: "unknown_error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Method not allowed. This endpoint only accepts POST requests.",
      allowed_methods: ["POST"],
    },
    { status: 405 }
  );
}
