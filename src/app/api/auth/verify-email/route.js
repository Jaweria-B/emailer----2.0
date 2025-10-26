// app/api/auth/verify-email/route.js
import { NextResponse } from 'next/server';
import { userDb, verificationDb, sessionDb, createDefaultSubscription } from '@/lib/database';

export async function POST(request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    // Verify the code
    const verification = await verificationDb.verify(email, code);

    if (!verification) {
      await verificationDb.incrementAttempts(email);
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Check if too many attempts
    if (verification.attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    // Get user data from verification record
    const userData = verification.user_data;

    if (!userData || !userData.password_hash) {
      return NextResponse.json(
        { error: 'Invalid verification data' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await userDb.findByEmail(email);

    if (user) {
      // User exists, just verify the email
      await userDb.verifyEmail(email);
    } else {
      // Create new user
      const result = await userDb.create({
        name: userData.name,
        email: userData.email,
        company: userData.company || null,
        job_title: userData.job_title || null,
        password_hash: userData.password_hash
      });

      const userId = result.lastInsertRowid;

      // 🆕 CREATE DEFAULT FREE SUBSCRIPTION for new user
      try {
        await createDefaultSubscription(userId);
        console.log('✅ Free plan assigned to new user:', userId, email);
      } catch (subError) {
        console.error('⚠️ Failed to assign free plan to user:', userId, subError);
        // Don't fail verification if subscription creation fails
        // User can still use the app, subscription can be fixed later
      }

      // Verify the user
      user = await userDb.verifyEmail(email);
    }

    // Clean up verification record
    await verificationDb.delete(email);

    // Create session
    const sessionToken = await sessionDb.create(user.id);

    // Create response with session cookie
    const response = NextResponse.json({
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

    // Set session cookie
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return response;

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}