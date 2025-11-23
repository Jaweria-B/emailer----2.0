import { NextResponse } from 'next/server';
import { sessionDb, walletDb } from '@/lib/database';

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await sessionDb.findValid(sessionToken);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const wallet = await walletDb.getBalance(user.id);

    return NextResponse.json({
      success: true,
      balance: wallet.balance,
      currency: wallet.currency
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}