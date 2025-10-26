// app/api/subscriptions/cancel/route.js
import { NextResponse } from 'next/server';
import { sessionDb, userSubscriptionsDb } from '@/lib/database';

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

    // Get current subscription
    const subscription = await userSubscriptionsDb.getCurrent(user.id);
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Don't allow cancelling Free plan
    if (subscription.plan_name === 'Free') {
      return NextResponse.json(
        { error: 'Cannot cancel Free plan' },
        { status: 400 }
      );
    }

    // Cancel subscription
    const cancelledSubscription = await userSubscriptionsDb.cancel(user.id);

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully. Access will continue until the end of your billing period.',
      subscription: {
        status: cancelledSubscription.status,
        cancelled_at: cancelledSubscription.cancelled_at,
        current_period_end: cancelledSubscription.current_period_end
      }
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}