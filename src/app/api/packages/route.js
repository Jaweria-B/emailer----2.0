import { NextResponse } from 'next/server';
import { packagesDb } from '@/lib/database';

export async function GET() {
  try {
    const packages = await packagesDb.getAll();
    
    return NextResponse.json({
      success: true,
      packages: packages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' }, 
      { status: 500 }
    );
  }
}