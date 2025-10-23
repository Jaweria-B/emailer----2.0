// app/api/auth/validate-session/route.js
import { NextResponse } from 'next/server';
import { sessionDb } from '@/lib/database';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body?.sessionToken
      || req.headers.get('cookie')?.match(/session_token=([^;]+)/)?.[1];

    if (!token) return NextResponse.json({ valid: false });

    const session = await sessionDb.findValid(token); // uses your DB
    if (session) {
      return NextResponse.json({ valid: true, user: session });
    } else {
      return NextResponse.json({ valid: false });
    }
  } catch (err) {
    console.error('validate-session error:', err);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
