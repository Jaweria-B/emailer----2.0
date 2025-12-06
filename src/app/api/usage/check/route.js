export async function POST(request) {
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

    const { action = 'generation', sendCount = 1 } = await request.json();
    
    if (!action || !['generation', 'send'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be either "generation" or "send"' },
        { status: 400 }
      );
    }

    const limitCheck = await checkEmailLimit(user.id, action, sendCount);

    return NextResponse.json({
      success: true,
      allowed: limitCheck.allowed,
      remaining: limitCheck.remaining,
      limit: limitCheck.limit,
      has_branding: limitCheck.has_branding,
      reason: limitCheck.reason,
      needs_package: limitCheck.needs_package || false, // NEW: indicates Pro user needs package
      sends_per_email: limitCheck.sends_per_email, // NEW: for Free plan
      package_sends_per_email: limitCheck.package_sends_per_email // NEW: for Pro plan
    });
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return NextResponse.json(
      { error: 'Failed to check usage limit' },
      { status: 500 }
    );
  }
}