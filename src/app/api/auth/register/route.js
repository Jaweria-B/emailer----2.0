// app/api/auth/register/route.js - UPDATED (No Password)
import { NextResponse } from 'next/server';
import { userDb, verificationDb } from '@/lib/database';
import { sendVerificationEmail, generateVerificationCode } from '@/lib/email-verification-service';

export async function POST(request) {
  try {
    const userData = await request.json();
    const { name, email, company, job_title } = userData;
    
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await userDb.findByEmail(email);
    if (existingUser) {
      if (existingUser.email_verified) {
        return NextResponse.json({ 
          error: 'User already exists and is verified. Please login instead.' 
        }, { status: 409 });
      } else {
        // User exists but not verified, resend verification
        return await handleResendVerification(email, name, 'registration');
      }
    }

    // Generate and send verification code
    const verificationCode = generateVerificationCode();
    await verificationDb.create(
      email, 
      verificationCode, 
      { name, email, company, job_title },
      'registration'
    );
    
    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationCode, name, 'registration');

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      return NextResponse.json({ 
        error: 'Failed to send verification email. Please try again.' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Registration initiated. Please check your email for verification code.',
      email: email
    });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to handle resending verification
async function handleResendVerification(email, name, verificationType = 'registration') {
  try {
    const verificationCode = generateVerificationCode();
    await verificationDb.create(email, verificationCode, { name, email }, verificationType);
    
    const emailResult = await sendVerificationEmail(email, verificationCode, name, verificationType);
    
    if (!emailResult.success) {
      return NextResponse.json({ 
        error: 'Failed to send verification email. Please try again.' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent. Please check your email.',
      email: email
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}