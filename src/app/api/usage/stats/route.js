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

    const stats = await emailUsageDb.getStats(user.id);
    
    if (!stats) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      plan_type: stats.plan_type,
      usage: stats
    });

  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}