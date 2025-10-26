// app/api/subscriptions/upgrade/route.js
import { NextResponse } from 'next/server';
import { sessionDb, userSubscriptionsDb, emailUsageDb, subscriptionPlansDb } from '@/lib/database';

export async function POST(request) {
  try {
    // 1. Get session token from cookies
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Verify session and get user
    const user = await sessionDb.findValid(sessionToken);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // 3. Get plan_id from request body
    const { plan_id } = await request.json();
    
    if (!plan_id) {
      return NextResponse.json(
        { error: 'plan_id is required' },
        { status: 400 }
      );
    }

    // 4. Verify the plan exists
    const targetPlan = await subscriptionPlansDb.getById(plan_id);
    
    if (!targetPlan) {
      return NextResponse.json(
        { error: 'Invalid plan_id' },
        { status: 404 }
      );
    }

    // 5. Get current subscription
    const currentSubscription = await userSubscriptionsDb.getCurrent(user.id);
    
    // 6. Check if already on this plan
    if (currentSubscription && currentSubscription.plan_id === plan_id) {
      return NextResponse.json(
        { error: 'You are already on this plan' },
        { status: 400 }
      );
    }

    console.log(`🔄 User ${user.id} (${user.email}) changing plan:`);
    console.log(`   From: ${currentSubscription?.plan_name || 'None'}`);
    console.log(`   To: ${targetPlan.name}`);

    // 7. Create/Update subscription with new plan
    // This will reset the billing period to today + 30 days
    // The ON CONFLICT in userSubscriptionsDb.create handles updates
    const newSubscription = await userSubscriptionsDb.create(user.id, plan_id);

    // 8. Create fresh usage record for the new billing period
    // This resets email counters to 0
    await emailUsageDb.create(
      user.id,
      newSubscription.id,
      new Date(newSubscription.current_period_start),
      new Date(newSubscription.current_period_end)
    );

    console.log(`✅ Successfully changed to ${targetPlan.name} plan`);
    console.log(`   New period: ${newSubscription.current_period_start} to ${newSubscription.current_period_end}`);

    // 9. Get updated subscription with all plan details
    const updatedSubscription = await userSubscriptionsDb.getCurrent(user.id);

    // 10. Return success response
    return NextResponse.json({
      success: true,
      message: `Successfully ${targetPlan.price > 0 ? 'upgraded to' : 'changed to'} ${targetPlan.name} plan!`,
      subscription: {
        id: updatedSubscription.id,
        plan_name: updatedSubscription.plan_name,
        price: updatedSubscription.price,
        billing_cycle: updatedSubscription.billing_cycle,
        status: updatedSubscription.status,
        current_period_start: updatedSubscription.current_period_start,
        current_period_end: updatedSubscription.current_period_end,
        has_branding: updatedSubscription.has_branding,
        simple_email_limit: updatedSubscription.simple_email_limit,
        personalized_email_limit: updatedSubscription.personalized_email_limit
      }
    });

  } catch (error) {
    console.error('❌ Upgrade subscription error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upgrade subscription. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// GET method to check current plan and available upgrade options
export async function GET(request) {
  try {
    // 1. Get session token
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Verify session
    const user = await sessionDb.findValid(sessionToken);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // 3. Get all available plans
    const allPlans = await subscriptionPlansDb.getAll();
    
    // 4. Get current subscription
    const currentSubscription = await userSubscriptionsDb.getCurrent(user.id);

    // 5. Filter out current plan from available options
    const availablePlans = allPlans.filter(
      plan => plan.id !== currentSubscription?.plan_id
    );

    return NextResponse.json({
      success: true,
      current_plan: {
        id: currentSubscription?.plan_id,
        name: currentSubscription?.plan_name,
        price: currentSubscription?.price
      },
      available_plans: availablePlans
    });

  } catch (error) {
    console.error('❌ Error fetching upgrade options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upgrade options' },
      { status: 500 }
    );
  }
}