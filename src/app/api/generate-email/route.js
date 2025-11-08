// app/api/generate-email/route.js 
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { EmailGenerationService } from '@/lib/ai-services';
import { AI_PROVIDERS } from '@/lib/ai-config';
import { 
  sessionDb, 
  anonymousDevicesDb, 
  checkEmailLimit, 
  emailUsageDb 
} from '@/lib/database';

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
      const limitCheck = await checkEmailLimit(user.id, 'simple');
      
      if (!limitCheck.allowed) {
        return NextResponse.json(
          { 
            error: limitCheck.reason || 'Email generation limit reached',
            limit: limitCheck.limit,
            remaining: 0,
            upgrade_required: true
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

    // Get the AIML API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI API key not configured on server' },
        { status: 500 }
      );
    }

    // Parse the request body
    const { prompt } = await request.json();

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Create the email generation service
    const emailService = new EmailGenerationService(AI_PROVIDERS.GEMINI, apiKey);

    // Generate the email
    const result = await emailService.generateEmail(prompt);

    // Validate the result
    if (!result || !result.subject || !result.body) {
      return NextResponse.json(
        { error: 'Invalid response from AI provider' },
        { status: 500 }
      );
    }

    // 🆕 ADD BRANDING IF REQUIRED (Free plan)
    if (hasBranding) {
      result.body = result.body + '\n\n---\nPowered by OpenPromote ⚡';
    }

    // Track usage
    if (user) {
      // Increment usage for authenticated users
      try {
        await emailUsageDb.incrementSimple(user.id);
      } catch (error) {
        console.error('Failed to track usage:', error);
        // Don't fail the request if usage tracking fails
      }
    } else {
      // Save device ID for anonymous users
      await anonymousDevicesDb.create(deviceId);
    }

    // Create the response
    const response = NextResponse.json({
      ...result,
      has_branding: hasBranding
    });

    // Set device cookie for new anonymous users
    if (!user && !cookieStore.get('device_id')?.value) {
      response.cookies.set('device_id', deviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
        sameSite: 'lax',
      });
    }

    return response;

  } catch (error) {
    console.error('Email generation error:', error);
    
    // if (error.message.includes('API error')) {
    //   return NextResponse.json(
    //     { error: `AI Provider Error: ${error.message}` },
    //     { status: 502 }
    //   );
    // }

    return NextResponse.json(
      { 
        error: 'We\'re having trouble generating your email right now. Please try again in a few moments.',
        user_friendly: true
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}