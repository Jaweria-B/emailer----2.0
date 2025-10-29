// app/api/auth/login/route.js - UPDATED (Code-Based Login)
import { NextResponse } from 'next/server';
import { userDb, verificationDb } from '@/lib/database';
import { sendVerificationEmail, generateVerificationCode } from '@/lib/email-verification-service';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Find user
    const user = await userDb.findByEmail(email);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'No account found with this email. Please register first.' 
      }, { status: 404 });
    }

    // Check if user is verified
    if (!user.email_verified) {
      return NextResponse.json({ 
        error: 'Email not verified. Please complete registration first.' 
      }, { status: 403 });
    }

    // Generate and send login verification code
    const verificationCode = generateVerificationCode();
    await verificationDb.create(
      email, 
      verificationCode, 
      null, // No user data needed for login
      'login'
    );

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationCode, user.name, 'login');

    if (!emailResult.success) {
      console.error('Failed to send login verification email:', emailResult.error);
      return NextResponse.json({ 
        error: 'Failed to send verification code. Please try again.' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email. Please check your inbox.',
      email: email
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}