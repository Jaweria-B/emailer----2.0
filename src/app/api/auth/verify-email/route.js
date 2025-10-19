// app/api/auth/verify-email/route.js
import { NextResponse } from 'next/server';
import { userDb, verificationDb, sessionDb } from '@/lib/database';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, code } = await request.json();
    
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
    }

    // Find verification record
    const verification = await verificationDb.verify(email, code);
    
    if (!verification) {
      // Increment attempts for rate limiting
      await verificationDb.incrementAttempts(email);
      return NextResponse.json({ 
        error: 'Invalid or expired verification code' 
      }, { status: 400 });
    }

    // Check attempts limit (max 5)
    if (verification.attempts >= 5) {
      return NextResponse.json({ 
        error: 'Too many verification attempts. Please request a new code.' 
      }, { status: 429 });
    }

    // Create user from verification data
    const userData = verification.user_data;
    if (!userData || !userData.name || !userData.email) {
      return NextResponse.json({ error: 'User data not found in verification record' }, { status: 400 });
    }

    const newUser = await userDb.create({
      name: userData.name,
      email: userData.email,
      company: userData.company,
      job_title: userData.job_title
    });

    // Verify user email
    const user = await userDb.verifyEmail(email);

    if (!user) {
      // This should ideally not happen if the user was just created
      return NextResponse.json({ error: 'Failed to verify user' }, { status: 500 });
    }

    // Clean up verification record
    await verificationDb.delete(email);

    // Create session
    const sessionToken = await sessionDb.create(user.id);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        job_title: user.job_title
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}