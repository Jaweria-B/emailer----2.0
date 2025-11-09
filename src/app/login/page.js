"use client";
import React, { useState } from 'react';
import { Mail, User, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import LinkButton from '@/components/linkButton';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to verification page with email and type
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}&type=login`);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background-secondary)' }}>
      <div className="bg-white rounded-2xl border shadow-xl w-full max-w-md p-8" style={{ borderColor: 'var(--border-light)' }}>
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
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Sign in to access EmailCurator
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="rounded-xl p-4 mb-6"
            style={{ 
              backgroundColor: 'var(--error-light)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--error)'
            }}
          >
            <p className="text-sm" style={{ color: 'var(--error)' }}>
              {error}
            </p>
          </div>
        )}

        {/* Info Message */}
        <div 
          className="rounded-xl p-4 mb-6"
          style={{ 
            backgroundColor: 'var(--primary-lightest)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--primary-lighter)'
          }}
        >
          <p className="text-sm" style={{ color: 'var(--primary-active)' }}>
            We'll send a verification code to your email to sign you in securely.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              className="block text-sm font-semibold mb-2 flex items-center gap-2"
              style={{ color: 'var(--foreground)' }}
            >
              <User className="h-4 w-4" style={{ color: 'var(--primary-color)' }} />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary-color)'
              }}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full"
            icon={isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <LogIn className="h-5 w-5" />
            )}
          >
            {isLoading ? 'Sending Code...' : 'Send Login Code'}
          </Button>
        </form>

        {/* Register Link */}
        <div 
          className="text-center mt-6 pt-6"
          style={{ 
            borderTopWidth: '1px',
            borderTopStyle: 'solid',
            borderTopColor: 'var(--border-light)'
          }}
        >
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?
          </p>
          <LinkButton
            href="/register"
            variant="text"
            icon={<UserPlus className="h-4 w-4" />}
            className="font-medium"
            style={{ color: 'var(--primary-color)' }}
          >
            Create Account
          </LinkButton>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;