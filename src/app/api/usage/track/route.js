import { NextResponse } from 'next/server';
import { sessionDb, emailUsageDb, userSubscriptionsDb } from '@/lib/database';

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

    const { action, sendCount = 1 } = await request.json();
    
    if (!action || !['generation', 'send'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be either "generation" or "send"' },
        { status: 400 }
      );
    }

    const subscription = await userSubscriptionsDb.getCurrent(user.id);
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    if (action === 'generation') {
      // Track generation
      await emailUsageDb.incrementGeneration(user.id);
      
      const updatedStats = await emailUsageDb.getStats(user.id);
      
      return NextResponse.json({
        success: true,
        message: 'Generation tracked successfully',
        plan_type: updatedStats.plan_type,
        usage: subscription.plan_name === 'Free' ? {
          generations_used: updatedStats.generations_used,
          generations_remaining: updatedStats.generations_remaining
        } : {
          package_generations_remaining: updatedStats.package_generations_remaining
        }
      });
    } 
    
    else if (action === 'send') {
      // Track sends
      await emailUsageDb.incrementSends(user.id, sendCount);
      
      const updatedStats = await emailUsageDb.getStats(user.id);
      
      return NextResponse.json({
        success: true,
        message: 'Sends tracked successfully',
        plan_type: updatedStats.plan_type,
        usage: subscription.plan_name === 'Free' ? {
          sends_used: updatedStats.sends_used
        } : {
          daily_sends_used: updatedStats.daily_sends_used,
          daily_sends_remaining: updatedStats.daily_sends_remaining
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error tracking usage:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to track usage' },
      { status: 500 }
    );
  }
}