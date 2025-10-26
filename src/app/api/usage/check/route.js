// ===========================================
// FILE 3: app/api/usage/check/route.js
// ===========================================
import { NextResponse } from 'next/server';
import { sessionDb, checkEmailLimit } from '@/lib/database';

export async function POST(request) {
  try {
    // Get session token from cookies
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify session and get user
    const user = await sessionDb.findValid(sessionToken);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Get email type from request body
    const { email_type } = await request.json();
    
    if (!email_type || !['simple', 'personalized'].includes(email_type)) {
      return NextResponse.json(
        { error: 'email_type must be either "simple" or "personalized"' },
        { status: 400 }
      );
    }

    // Check if user can generate this type of email
    const limitCheck = await checkEmailLimit(user.id, email_type);

    return NextResponse.json({
      success: true,
      allowed: limitCheck.allowed,
      remaining: limitCheck.remaining,
      limit: limitCheck.limit,
      has_branding: limitCheck.has_branding,
      reason: limitCheck.reason
    });
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return NextResponse.json(
      { error: 'Failed to check usage limit' },
      { status: 500 }
    );
  }
}
