"use client";
import React, { useState } from 'react';
import { Mail, User, Building, Briefcase, UserPlus, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import LinkButton from '@/components/linkButton';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    job_title: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to verification page with email parameter
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}&type=registration`);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            Join EmailCurator
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Create your account to get started
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

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              className="block text-sm font-semibold mb-2 flex items-center gap-2"
              style={{ color: 'var(--foreground)' }}
            >
              <User className="h-4 w-4" style={{ color: 'var(--primary-color)' }} />
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Your full name"
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

          <div>
            <label 
              className="block text-sm font-semibold mb-2 flex items-center gap-2"
              style={{ color: 'var(--foreground)' }}
            >
              <Mail className="h-4 w-4" style={{ color: 'var(--primary-color)' }} />
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
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

          <div>
            <label 
              className="block text-sm font-semibold mb-2 flex items-center gap-2"
              style={{ color: 'var(--foreground)' }}
            >
              <Building className="h-4 w-4" style={{ color: 'var(--primary-color)' }} />
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Your company name"
              className="w-full border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)',
                color: 'var(--foreground)',
                '--tw-ring-color': 'var(--primary-color)'
              }}
            />
          </div>

          <div>
            <label 
              className="block text-sm font-semibold mb-2 flex items-center gap-2"
              style={{ color: 'var(--foreground)' }}
            >
              <Briefcase className="h-4 w-4" style={{ color: 'var(--primary-color)' }} />
              Job Title
            </label>
            <input
              type="text"
              value={formData.job_title}
              onChange={(e) => handleInputChange('job_title', e.target.value)}
              placeholder="Your job title"
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
            className="w-full mt-6"
            icon={isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <UserPlus className="h-5 w-5" />
            )}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {/* Login Link */}
        <div 
          className="text-center mt-6 pt-6"
          style={{ 
            borderTopWidth: '1px',
            borderTopStyle: 'solid',
            borderTopColor: 'var(--border-light)'
          }}
        >
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?
          </p>
          <LinkButton
            href="/login"
            variant="text"
            icon={<LogIn className="h-4 w-4" />}
            className="font-medium"
            style={{ color: 'var(--primary-color)' }}
          >
            Sign In
          </LinkButton>
        </div>
      </div>
    </div>
  );
};

export default Register;