import { NextResponse } from 'next/server';
import { creditBundlesDb } from '@/lib/database';

export async function GET() {
  try {
    const bundles = await creditBundlesDb.getAll();
    
    return NextResponse.json({
      success: true,
      bundles
    });
  } catch (error) {
    console.error('Error fetching bundles:', error);
    return NextResponse.json({ error: 'Failed to fetch bundles' }, { status: 500 });
  }
}