// ===========================================
// FILE 4: app/api/usage/track/route.js
// ===========================================
import { NextResponse } from 'next/server';
import { sessionDb, emailUsageDb } from '@/lib/database';

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

    // Get email type and count from request body
    const { email_type, count = 1 } = await request.json();
    
    if (!email_type || !['simple', 'personalized'].includes(email_type)) {
      return NextResponse.json(
        { error: 'email_type must be either "simple" or "personalized"' },
        { status: 400 }
      );
    }

    // Increment usage counter
    let updatedUsage;
    if (email_type === 'simple') {
      updatedUsage = await emailUsageDb.incrementSimple(user.id);
    } else {
      updatedUsage = await emailUsageDb.incrementPersonalized(user.id, count);
    }

    return NextResponse.json({
      success: true,
      message: 'Usage tracked successfully',
      usage: {
        simple_emails_used: updatedUsage.simple_emails_used,
        personalized_emails_used: updatedUsage.personalized_emails_used
      }
    });
  } catch (error) {
    console.error('Error tracking usage:', error);
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    );
  }
}