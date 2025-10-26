// app/api/subscriptions/plans/route.js
import { NextResponse } from 'next/server';
import { subscriptionPlansDb } from '@/lib/database';

export async function GET() {
  try {
    const plans = await subscriptionPlansDb.getAll();
    
    return NextResponse.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}