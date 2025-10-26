// ===========================================
// FILE 5: app/api/usage/stats/route.js
// ===========================================
import { NextResponse } from 'next/server';
import { sessionDb, emailUsageDb } from '@/lib/database';

export async function GET(request) {
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

    // Get usage statistics
    const stats = await emailUsageDb.getStats(user.id);
    
    if (!stats) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      usage: {
        simple_emails: {
          used: stats.simple_emails_used,
          limit: stats.simple_emails_limit,
          remaining: stats.simple_emails_remaining,
          percentage: stats.simple_emails_limit > 0 
            ? Math.round((stats.simple_emails_used / stats.simple_emails_limit) * 100)
            : 0
        },
        personalized_emails: {
          used: stats.personalized_emails_used,
          limit: stats.personalized_emails_limit,
          remaining: stats.personalized_emails_remaining,
          percentage: stats.personalized_emails_limit > 0 
            ? Math.round((stats.personalized_emails_used / stats.personalized_emails_limit) * 100)
            : 0
        },
        plan: {
          name: stats.plan_name,
          price: stats.price,
          has_branding: stats.has_branding
        },
        period_end: stats.period_end
      }
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}