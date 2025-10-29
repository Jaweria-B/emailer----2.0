// app/api/auth/verify-email/route.js - UPDATED (Handles Both Types)
import { NextResponse } from 'next/server';
import { userDb, verificationDb, sessionDb, createDefaultSubscription } from '@/lib/database';

export async function POST(request) {
  try {
    const { email, code, verificationType } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    // Verify the code with type
    const verification = await verificationDb.verify(email, code, verificationType);

    if (!verification) {
      await verificationDb.incrementAttempts(email, verificationType);
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

    let user;
    let sessionToken;

    // Handle based on verification type
    if (verification.verification_type === 'registration') {
      // REGISTRATION FLOW
      const userData = verification.user_data;

      if (!userData) {
        return NextResponse.json(
          { error: 'Invalid verification data' },
          { status: 400 }
        );
      }

      // Check if user already exists
      user = await userDb.findByEmail(email);

      if (user) {
        // User exists, just verify the email
        await userDb.verifyEmail(email);
      } else {
        // Create new user (without password_hash)
        const result = await userDb.create({
          name: userData.name,
          email: userData.email,
          company: userData.company || null,
          job_title: userData.job_title || null,
          password_hash: null
        });

        const userId = result.lastInsertRowid;

        // Create default free subscription for new user
        try {
          await createDefaultSubscription(userId);
          console.log('✅ Free plan assigned to new user:', userId, email);
        } catch (subError) {
          console.error('⚠️ Failed to assign free plan to user:', userId, subError);
        }

        // Verify the user
        user = await userDb.verifyEmail(email);
      }

      // Create session for new registration
      sessionToken = await sessionDb.create(user.id);

    } else if (verification.verification_type === 'login') {
      // LOGIN FLOW
      user = await userDb.findByEmail(email);

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      if (!user.email_verified) {
        return NextResponse.json(
          { error: 'Email not verified' },
          { status: 403 }
        );
      }

      // Create session for login
      sessionToken = await sessionDb.create(user.id);

    } else {
      return NextResponse.json(
        { error: 'Invalid verification type' },
        { status: 400 }
      );
    }

    // Clean up verification record
    await verificationDb.delete(email, verificationType);

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: verification.verification_type === 'login' 
        ? 'Login successful' 
        : 'Email verified successfully',
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