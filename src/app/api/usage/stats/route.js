// src/app/api/usage/stats/route.js
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

    // FREE PLAN RESPONSE
    if (stats.plan_type === 'free') {
      return NextResponse.json({
        success: true,
        plan_type: 'free',
        usage: {
          generations: {
            used: stats.generations_used,
            limit: stats.generations_limit,
            remaining: stats.generations_remaining,
            percentage: stats.generations_limit > 0 
              ? Math.round((stats.generations_used / stats.generations_limit) * 100)
              : 0
          },
          sends: {
            used: stats.sends_used,
            limit: stats.sends_limit,
            remaining: stats.sends_remaining,
            per_generation: stats.sends_per_generation,
            percentage: stats.sends_limit > 0 
              ? Math.round((stats.sends_used / stats.sends_limit) * 100)
              : 0
          },
          plan: {
            name: stats.plan_name,
            has_branding: stats.has_branding
          },
          period_end: stats.period_end
        }
      });
    }

    // PRO PLAN RESPONSE
    else if (stats.plan_type === 'pro') {
      return NextResponse.json({
        success: true,
        plan_type: 'pro',
        usage: {
          wallet: {
            balance: stats.wallet_balance,
            currency: stats.currency
          },
          spending: {
            total_spent: stats.total_spent,
            price_per_generation: stats.price_per_generation,
            price_per_send: stats.price_per_send
          },
          plan: {
            name: stats.plan_name,
            has_branding: stats.has_branding
          },
          period_end: stats.period_end
        }
      });
    }

    // Fallback if neither free nor pro
    return NextResponse.json(
      { error: 'Invalid plan type' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}
