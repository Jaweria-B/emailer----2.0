export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

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

    // FOR FREE PLAN
    if (subscription.plan_name === 'Free') {
      return NextResponse.json({
        success: true,
        subscription: {
          id: subscription.id,
          plan_name: subscription.plan_name,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          has_branding: subscription.has_branding,
          generation_limit: subscription.generation_limit,
          sends_per_email: subscription.sends_per_email
        },
        usage: stats
      });
    }

    // FOR PRO PLAN
    if (subscription.plan_name === 'Pro') {
      const packageDetails = await userSubscriptionsDb.getPackageDetails(user.id);
      
      return NextResponse.json({
        success: true,
        subscription: {
          id: subscription.id,
          plan_name: subscription.plan_name,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          has_branding: subscription.has_branding,
          max_daily_sends: subscription.max_daily_sends
        },
        package: packageDetails ? {
          package_id: packageDetails.package_id,
          package_name: packageDetails.package_name,
          generations_remaining: subscription.package_generations_remaining,
          sends_per_email: subscription.package_sends_per_email,
          purchased_at: subscription.package_purchased_at
        } : null,
        usage: stats
      });
    }

    return NextResponse.json(
      { error: 'Invalid plan configuration' },
      { status: 500 }
    );
    
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    );
  }
}