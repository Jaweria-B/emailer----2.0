// app/api/generate-email/route.js 
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { EmailGenerationService } from '@/lib/ai-services';
import { AI_PROVIDERS } from '@/lib/ai-config';
import { 
  sessionDb, 
  anonymousDevicesDb, 
  checkEmailLimit, 
  emailUsageDb,
  userSubscriptionsDb
} from '@/lib/database';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const cookieStore = request.cookies;
    const sessionToken = cookieStore.get('session_token')?.value;
    let deviceId = cookieStore.get('device_id')?.value;

    let user = null;
    let hasBranding = true; // Default to true for anonymous users
    
    if (sessionToken) {
      user = await sessionDb.findValid(sessionToken);
    }

    // For authenticated users, check subscription limits
    if (user) {
      const limitCheck = await checkEmailLimit(user.id, 'generation');
      
      if (!limitCheck.allowed) {
        return NextResponse.json(
          { 
            error: limitCheck.reason || 'Email generation limit reached',
            limit: limitCheck.limit,
            remaining: 0,
            upgrade_required: true,
            needs_package: limitCheck.needs_package || false 
          },
          { status: 403 }
        );
      }
      
      hasBranding = limitCheck.has_branding;
    } else {
      // For anonymous users, check device ID
      let isNewDevice = false;
      if (!deviceId) {
        deviceId = uuidv4();
        isNewDevice = true;
      }

      const existingDevice = await anonymousDevicesDb.findByDeviceId(deviceId);
      if (existingDevice) {
        return NextResponse.json(
          { 
            error: 'You have already generated your free email. Please sign in to continue.',
            sign_in_required: true
          },
          { status: 403 }
        );
      }
    }

    // Get the GEMINI API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'Email generation service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Parse the request body
    const { prompt } = await request.json();

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: 'Email content is required. Please describe what you want to say.' },
        { status: 400 }
      );
    }

    // Create the email generation service
    const emailService = new EmailGenerationService(AI_PROVIDERS.GEMINI, apiKey);

    // Generate the email with retry logic built-in
    let result;
    try {
      result = await emailService.generateEmail(prompt);
    } catch (generationError) {
      console.error('Email generation failed:', generationError);
      
      // Handle specific error types with user-friendly messages
      if (generationError.message.includes('503') || generationError.message.includes('overloaded')) {
        return NextResponse.json(
          { 
            error: 'Our AI service is experiencing high demand right now. Please try again in a few moments.',
            retry_suggested: true,
            error_type: 'service_overload'
          },
          { status: 503 }
        );
      }
      
      if (generationError.message.includes('429') || generationError.message.includes('rate limit')) {
        return NextResponse.json(
          { 
            error: 'We\'ve reached our temporary rate limit. Please wait 30 seconds and try again.',
            retry_suggested: true,
            error_type: 'rate_limit'
          },
          { status: 429 }
        );
      }
      
      if (generationError.message.includes('timeout')) {
        return NextResponse.json(
          { 
            error: 'The request took too long to process. Please try generating your email again.',
            retry_suggested: true,
            error_type: 'timeout'
          },
          { status: 504 }
        );
      }
      
      if (generationError.message.includes('Authentication failed') || generationError.message.includes('401')) {
        console.error('API authentication failed - check GEMINI_API_KEY');
        return NextResponse.json(
          { 
            error: 'There\'s a configuration issue with our email service. Please contact support.',
            error_type: 'auth_error'
          },
          { status: 500 }
        );
      }

      if (generationError.message.includes('Invalid request') || generationError.message.includes('400')) {
        return NextResponse.json(
          { 
            error: 'Your request couldn\'t be processed. Please check your input and try again.',
            error_type: 'invalid_request'
          },
          { status: 400 }
        );
      }

      // Generic generation error
      return NextResponse.json(
        { 
          error: 'We\'re having trouble generating your email right now. Please try again in a few moments.',
          retry_suggested: true,
          error_type: 'generation_failed'
        },
        { status: 500 }
      );
    }

    // Validate the result
    if (!result || !result.subject || !result.body) {
      console.error('Invalid result from AI service:', result);
      return NextResponse.json(
        { 
          error: 'The AI generated an incomplete email. Please try again.',
          retry_suggested: true,
          error_type: 'invalid_response'
        },
        { status: 500 }
      );
    }

    // ADD BRANDING IF REQUIRED (Free plan)
    if (hasBranding) {
      result.body = result.body + '\n\n---\nPowered by OpenPromote ⚡';
    }

    // Track usage for authenticated users
    if (user) {
      try {
        const subscription = await userSubscriptionsDb.getCurrent(user.id);
        
        // For both Free and Pro users, decrement package generations
        if (subscription.plan_name === 'Free') {
          // Increment generation count for Free plan
          await emailUsageDb.incrementGeneration(user.id);
          console.log(`✅ Free plan generation tracked for user ${user.id}`);
        } else if (subscription.plan_name === 'Pro') {
          // Decrement package generations for Pro plan
          await sql`
            UPDATE user_subscriptions
            SET 
              package_generations_remaining = GREATEST(package_generations_remaining - 1, 0),
              updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ${user.id}
          `;
          console.log(`✅ Pro plan generation tracked for user ${user.id}`);
        }
      } catch (error) {
        console.error('Failed to track usage:', error);
        // Don't fail the request if usage tracking fails
      }
    } else {
      // Save device ID for anonymous users
      try {
        await anonymousDevicesDb.create(deviceId);
        console.log(`✅ Anonymous device tracked: ${deviceId}`);
      } catch (deviceError) {
        console.error('Failed to track anonymous device:', deviceError);
        // Don't fail the request if device tracking fails
      }
    }

    // Create the response
    const response = NextResponse.json({
      subject: result.subject,
      body: result.body,
      has_branding: hasBranding,
      success: true
    });

    // Set device cookie for new anonymous users
    if (!user && !cookieStore.get('device_id')?.value) {
      response.cookies.set('device_id', deviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
        sameSite: 'lax',
        path: '/'
      });
    }

    console.log(`✅ Email generated successfully ${user ? `for user ${user.id}` : 'for anonymous user'}`);
    return response;

  } catch (error) {
    console.error('❌ Unexpected error in email generation route:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          error: 'Invalid request format. Please try again.',
          error_type: 'parse_error'
        },
        { status: 400 }
      );
    }

    // Handle database errors
    if (error.message && error.message.includes('database')) {
      return NextResponse.json(
        { 
          error: 'We\'re experiencing a temporary database issue. Please try again shortly.',
          retry_suggested: true,
          error_type: 'database_error'
        },
        { status: 503 }
      );
    }

    // Generic catch-all error
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
        retry_suggested: true,
        error_type: 'unknown_error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method not allowed. This endpoint only accepts POST requests.',
      allowed_methods: ['POST']
    },
    { status: 405 }
  );
}