// app/api/subscriptions/create/route.js

import { NextResponse } from 'next/server';
import { sessionDb, userSubscriptionsDb, subscriptionPlansDb, emailUsageDb } from '@/lib/database';

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

    // Get plan_id from request body
    const { plan_id } = await request.json();
    
    if (!plan_id) {
      return NextResponse.json(
        { error: 'plan_id is required' },
        { status: 400 }
      );
    }

    // Verify the plan exists
    const plan = await subscriptionPlansDb.getById(plan_id);
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan_id' },
        { status: 400 }
      );
    }

    // Calculate period dates
    const periodStart = new Date();
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1); // 1 month from now

    // Create or update subscription
    const subscription = await userSubscriptionsDb.create(
      user.id,
      plan_id,
      periodStart,
      periodEnd
    );

    // Create new usage record for the new period
    await emailUsageDb.create(
      user.id,
      subscription.id,
      periodStart,
      periodEnd
    );

    return NextResponse.json({
      success: true,
      message: `Successfully subscribed to ${plan.name} plan`,
      subscription: {
        id: subscription.id,
        plan_name: plan.name,
        price: plan.price,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}