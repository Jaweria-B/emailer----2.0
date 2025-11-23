import { NextResponse } from 'next/server';
import { sessionDb, emailUsageDb, userSubscriptionsDb, walletDb } from '@/lib/database';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

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

    const { 
      action, 
      sendCount = 1,
      email_subject = null,
      cost = null 
    } = await request.json();
    
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

    let updatedUsage;

    // FREE PLAN
    if (subscription.plan_name === 'Free') {
      if (action === 'generation') {
        updatedUsage = await emailUsageDb.incrementGeneration(user.id);
      } else if (action === 'send') {
        updatedUsage = await emailUsageDb.incrementSends(user.id, sendCount);
      }

      return NextResponse.json({
        success: true,
        message: 'Usage tracked successfully',
        plan_type: 'free',
        usage: {
          generations_used: updatedUsage.generations_count,
          sends_used: updatedUsage.sends_count
        }
      });
    }
    
    // PRO PLAN
    else if (subscription.plan_name === 'Pro') {
      if (!cost || cost <= 0) {
        return NextResponse.json(
          { error: 'cost is required for Pro plan tracking' },
          { status: 400 }
        );
      }

      await walletDb.deduct(
        user.id,
        cost,
        action,
        email_subject ? `${action}: ${email_subject}` : action
      );

      await sql`
        UPDATE email_usage
        SET total_spent = total_spent + ${cost},
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${user.id} 
          AND period_start <= NOW() 
          AND period_end >= NOW()
      `;

      const wallet = await walletDb.getBalance(user.id);

      return NextResponse.json({
        success: true,
        message: 'Usage tracked and wallet updated',
        plan_type: 'pro',
        cost_deducted: cost,
        wallet_balance: wallet.balance
      });
    }

    return NextResponse.json(
      { error: 'Invalid plan configuration' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Error tracking usage:', error);
    
    if (error.message === 'Insufficient balance') {
      return NextResponse.json(
        { error: 'Insufficient wallet balance' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    );
  }
}