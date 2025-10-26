// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { userDb, verificationDb, createDefaultSubscription } from '@/lib/database';
import { sendVerificationEmail, generateVerificationCode } from '@/lib/email-verification-service';
import bcrypt from 'bcryptjs';

// Password validation function
function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>?/)');
  }
  
  // Check for common weak passwords
  const commonPasswords = ['password', '12345678', 'qwerty123', 'abc123'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password is too common. Please choose a stronger password');
  }
  
  return errors;
}

export async function POST(request) {
  try {
    const userData = await request.json();
    const { name, email, company, job_title, password, confirm_password } = userData;
    
    if (!name || !email || !password || !confirm_password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    if (password !== confirm_password) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Password does not meet requirements',
        details: passwordErrors 
      }, { status: 400 });
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
        return NextResponse.json({ error: 'User already exists and is verified' }, { status: 409 });
      } else {
        // User exists but not verified, resend verification
        return await handleResendVerification(email, name);
      }
    }

    // Hash password and store hash in verification record
    const password_hash = bcrypt.hashSync(password, 10);

    // Generate and send verification code
    const verificationCode = generateVerificationCode();
    await verificationDb.create(email, verificationCode, { name, email, company, job_title, password_hash });
    
    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationCode, name, { name, email, company, job_title });

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      return NextResponse.json({ 
        error: 'Failed to send verification email. Please try again.' 
      }, { status: 500 });
    }

    // 🆕 NOTE: Subscription will be created AFTER email verification
    // We don't create the subscription here because the user hasn't been created yet
    // The subscription will be created in the verify-email route after user is created
    // (See updated verify-email route)

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
async function handleResendVerification(email, name) {
  try {
    const verificationCode = generateVerificationCode();
    // Pass user data to the create function
    await verificationDb.create(email, verificationCode, { name, email });
    
    const emailResult = await sendVerificationEmail(email, verificationCode, name);
    
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