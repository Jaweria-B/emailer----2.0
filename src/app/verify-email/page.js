"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { Mail, Check, X, RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/providers/AuthProvider';

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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white/20 backdrop-blur-lg rounded-full p-4 border border-white/30 w-fit mx-auto mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Verify Login' : 'Verify Your Email'}
          </h1>
          <p className="text-purple-100">
            We've sent a 6-digit code to
          </p>
          <p className="text-white font-medium mt-1">{email}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-6 flex items-start gap-2">
            <X className="h-5 w-5 text-red-300 flex-shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {resendSuccess && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 mb-6 flex items-start gap-2">
            <Check className="h-5 w-5 text-green-300 flex-shrink-0 mt-0.5" />
            <p className="text-green-200 text-sm">New verification code sent!</p>
          </div>
        )}

        {/* Code Input */}
        <div className="mb-6">
          <label className="block text-purple-100 text-sm font-medium mb-3 text-center">
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
                className="w-12 h-14 bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl text-white text-2xl text-center font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
              />
            ))}
          </div>
          <p className="text-purple-200 text-xs text-center">
            Code expires in 15 minutes
          </p>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={isLoading || code.join('').length !== 6}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mb-4"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Verifying...
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              Verify {isLogin ? 'Login' : 'Email'}
            </>
          )}
        </button>

        {/* Resend Code */}
        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-purple-200 hover:text-white text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors disabled:opacity-50"
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
  <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl w-full max-w-md">
      <div className="text-center">
        <div className="bg-white/20 backdrop-blur-lg rounded-full p-4 border border-white/30 w-fit mx-auto mb-4">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">
          Verify Your Email
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="text-purple-100 text-sm mt-4">Loading...</p>
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