// ===========================================
// FILE 1: app/api/subscriptions/current/route.js
// ===========================================
import { NextResponse } from 'next/server';
import { sessionDb, userSubscriptionsDb, emailUsageDb } from '@/lib/database';

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

    // Get current subscription
    const subscription = await userSubscriptionsDb.getCurrent(user.id);
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Get usage stats
    const stats = await emailUsageDb.getStats(user.id);

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan_name: subscription.plan_name,
        price: subscription.price,
        billing_cycle: subscription.billing_cycle,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        has_branding: subscription.has_branding
      },
      usage: stats
    });
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    );
  }
}