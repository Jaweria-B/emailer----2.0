"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { Mail, Check, X, RefreshCw, Shield } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/providers/AuthProvider';
import Button from '@/components/button';

function VerifyEmailContent() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuthContext();
  
  const email = searchParams.get('email');
  const verificationType = searchParams.get('type') || 'registration';
  const isLogin = verificationType === 'login';

  useEffect(() => {
    if (!email) {
      router.push(isLogin ? '/login' : '/register');
    }
  }, [email, router, isLogin]);

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setCode(newCode);
    
    const nextEmptyIndex = newCode.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    document.getElementById(`code-${focusIndex}`)?.focus();
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          code: verificationCode,
          verificationType 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await refreshUser();
        router.push('/dashboard');
      } else {
        setError(data.error || 'Verification failed');
        setCode(['', '', '', '', '', '']);
        document.getElementById('code-0')?.focus();
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendSuccess(false);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/resend-verification';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendSuccess(true);
        setCode(['', '', '', '', '', '']);
        setTimeout(() => setResendSuccess(false), 3000);
      } else {
        setError(data.error || 'Failed to resend code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--background-secondary)' }}
    >
      <div 
        className="bg-white rounded-2xl border shadow-xl w-full max-w-md p-8"
        style={{ borderColor: 'var(--border-light)' }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div 
            className="rounded-lg p-4 w-fit mx-auto mb-4 shadow-md"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            {isLogin ? 'Verify Login' : 'Verify Your Email'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            We've sent a 6-digit code to
          </p>
          <p 
            className="font-medium mt-1"
            style={{ color: 'var(--foreground)' }}
          >
            {email}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="rounded-xl p-3 mb-6 flex items-start gap-2"
            style={{ 
              backgroundColor: 'var(--error-light)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--error)'
            }}
          >
            <X 
              className="h-5 w-5 flex-shrink-0 mt-0.5"
              style={{ color: 'var(--error)' }}
            />
            <p 
              className="text-sm"
              style={{ color: 'var(--error)' }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Success Message */}
        {resendSuccess && (
          <div 
            className="rounded-xl p-3 mb-6 flex items-start gap-2"
            style={{ 
              backgroundColor: 'var(--success-light)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--success)'
            }}
          >
            <Check 
              className="h-5 w-5 flex-shrink-0 mt-0.5"
              style={{ color: 'var(--success)' }}
            />
            <p 
              className="text-sm"
              style={{ color: 'var(--success)' }}
            >
              New verification code sent!
            </p>
          </div>
        )}

        {/* Code Input */}
        <div className="mb-6">
          <label 
            className="block text-sm font-medium mb-3 text-center"
            style={{ color: 'var(--foreground)' }}
          >
            Enter Verification Code
          </label>
          <div className="flex justify-center gap-2 mb-4">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 border rounded-xl text-2xl text-center font-bold focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border-medium)',
                  color: 'var(--foreground)',
                  '--tw-ring-color': 'var(--primary-color)'
                }}
              />
            ))}
          </div>
          <p 
            className="text-xs text-center"
            style={{ color: 'var(--text-secondary)' }}
          >
            Code expires in 15 minutes
          </p>
        </div>

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          disabled={isLoading || code.join('').length !== 6}
          variant="primary"
          className="w-full mb-4"
          icon={isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Check className="h-5 w-5" />
          )}
        >
          {isLoading ? 'Verifying...' : `Verify ${isLogin ? 'Login' : 'Email'}`}
        </Button>

        {/* Resend Code */}
        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors disabled:opacity-50"
            style={{ 
              color: isResending ? 'var(--text-tertiary)' : 'var(--primary-color)'
            }}
          >
            <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
            {isResending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
}


// Loading component for Suspense fallback
const VerifyEmailLoading = () => (
  <div 
    className="min-h-screen flex items-center justify-center p-4"
    style={{ backgroundColor: 'var(--background-secondary)' }}
  >
    <div 
      className="bg-white rounded-2xl border shadow-xl w-full max-w-md p-8"
      style={{ borderColor: 'var(--border-light)' }}
    >
      <div className="text-center">
        <div 
          className="rounded-full p-4 w-fit mx-auto mb-4 shadow-md"
          style={{ backgroundColor: 'var(--primary-color)' }}
        >
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 
          className="text-3xl font-bold mb-4"
          style={{ color: 'var(--foreground)' }}
        >
          Verify Your Email
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: 'var(--primary-color)' }}></div>
        <p 
          className="text-sm mt-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          Loading...
        </p>
      </div>
    </div>
  </div>
);

// Main component with Suspense boundary
const VerifyEmail = () => {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmail;