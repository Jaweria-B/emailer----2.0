"use client";
import React, { useState } from 'react';
import { Mail, User, Building, Briefcase, UserPlus, LogIn, Check, X, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    job_title: ''
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // <-- new
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // <-- new
  const router = useRouter();

  // Password validation checks
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const allPasswordChecksPassed = Object.values(passwordChecks).every(check => check);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const body = { ...formData, password, confirm_password: confirmPassword };
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to verification page with email parameter
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        // Show all validation errors if available
        if (data.details && Array.isArray(data.details)) {
          setError(data.details.join('. '));
        } else {
          setError(data.error || 'Registration failed');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white/20 backdrop-blur-lg rounded-full p-4 border border-white/30 w-fit mx-auto mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Join EmailCurator
          </h1>
          <p className="text-purple-100">
            Create your account to get started
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-6">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Register Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-purple-100 text-sm font-medium mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Your full name"
              required
              className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-purple-100 text-sm font-medium mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-purple-100 text-sm font-medium mb-2">
              <Building className="h-4 w-4 inline mr-2" />
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Your company name"
              className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-purple-100 text-sm font-medium mb-2">
              <Briefcase className="h-4 w-4 inline mr-2" />
              Job Title
            </label>
            <input
              type="text"
              value={formData.job_title}
              onChange={(e) => handleInputChange('job_title', e.target.value)}
              placeholder="Your job title"
              className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-purple-100 text-sm font-medium mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Password *
            </label>

            {/* Password input with eye toggle */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setShowPasswordRequirements(true)}
                placeholder="Enter a secure password"
                required
                className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 pr-12 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-3 flex items-center px-2"
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-white/80" /> : <Eye className="h-5 w-5 text-white/80" />}
              </button>
            </div>

            {/* Password Requirements */}
            {showPasswordRequirements && password && (
              <div className="mt-3 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <p className="text-purple-100 text-xs font-semibold mb-2">Password must contain:</p>
                <div className="space-y-1">
                  <PasswordCheck met={passwordChecks.length} text="At least 8 characters" />
                  <PasswordCheck met={passwordChecks.uppercase} text="One uppercase letter (A-Z)" />
                  <PasswordCheck met={passwordChecks.lowercase} text="One lowercase letter (a-z)" />
                  <PasswordCheck met={passwordChecks.number} text="One number (0-9)" />
                  <PasswordCheck met={passwordChecks.special} text="One special character (!@#$%...)" />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-purple-100 text-sm font-medium mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Confirm Password *
            </label>

            {/* Confirm password input with eye toggle */}
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-3 pr-12 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(prev => !prev)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute inset-y-0 right-3 flex items-center px-2"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5 text-white/80" /> : <Eye className="h-5 w-5 text-white/80" />}
              </button>
            </div>

            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-300 text-xs mt-2 flex items-center gap-1">
                <X className="h-3 w-3" />
                Passwords do not match
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !allPasswordChecksPassed || password !== confirmPassword}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Create Account
              </>
            )}
          </button>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6 pt-6 border-t border-white/20">
          <p className="text-purple-200 text-sm mb-3">
            Already have an account?
          </p>
          <Link
            href="/login"
            className="text-purple-300 hover:text-white font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

// Helper component for password requirement checks
const PasswordCheck = ({ met, text }) => (
  <div className="flex items-center gap-2 text-xs">
    {met ? (
      <Check className="h-3 w-3 text-green-400" />
    ) : (
      <X className="h-3 w-3 text-red-400" />
    )}
    <span className={met ? 'text-green-300' : 'text-purple-200'}>{text}</span>
  </div>
);

export default Register;
