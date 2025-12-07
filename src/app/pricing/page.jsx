'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2, Sparkles, Zap, Crown, Package as PackageIcon } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { useAuthContext } from '@/providers/AuthProvider';
import Button from '@/components/button';
import LinkButton from '@/components/linkButton';

export default function PricingPage() {
  const router = useRouter();
  const { user, isLoadingUser } = useAuthContext();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(null);

  useEffect(() => {
    if (user && !isLoadingUser) {
      fetchCurrentSubscription();
    } else if (!isLoadingUser) {
      setLoading(false);
    }
  }, [user, isLoadingUser]);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/current');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Current subscription:', data.subscription);
        console.log('📊 Usage stats:', data.usage);
        setCurrentSubscription(data.subscription);
        setUsage(data.usage);
      }
    } catch (error) {
      console.error('❌ Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFreeAction = async () => {
    console.log('🎯 Free plan clicked');
    console.log('👤 User:', user);
    console.log('📋 Current plan:', currentSubscription?.plan_name);

    // If not authenticated, redirect to login
    if (!user) {
      console.log('🔒 User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    // If already on Free plan
    if (currentSubscription?.plan_name === 'Free') {
      console.log('✅ Already on Free plan, going to dashboard');
      router.push('/dashboard');
      return;
    }

    // If on Pro plan and want to downgrade
    setUpgrading('free');
    
    try {
      console.log('🚀 Downgrading to Free plan');
      const response = await fetch('/api/subscriptions/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: 1 }) // Free plan ID
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Downgrade successful!');
        await fetchCurrentSubscription();
        alert('Successfully downgraded to Free plan!');
      } else {
        console.error('❌ Downgrade failed:', data.error);
        // Only show alert if it's not "already on this plan"
        if (data.error !== 'You are already on this plan') {
          alert(data.error || 'Failed to change plan');
        } else {
          // Refresh data and show we're already on this plan
          await fetchCurrentSubscription();
        }
      }
    } catch (error) {
      console.error('❌ Downgrade error:', error);
      alert('Failed to change plan. Please try again.');
    } finally {
      setUpgrading(null);
    }
  };

  const handleExplorePackages = () => {
    console.log('🎯 Explore packages clicked');
    
    if (!user) {
      console.log('🔒 User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    router.push('/packages');
  };

  // Fixed: Check actual current subscription plan
  const isFreePlanCurrent = currentSubscription?.plan_name === 'Free';
  const isProPlanCurrent = currentSubscription?.plan_name === 'Pro';

  console.log('🔍 Plan Status:', {
    isFreeCurrent: isFreePlanCurrent,
    isProCurrent: isProPlanCurrent,
    currentPlanName: currentSubscription?.plan_name
  });

  const getFreeButtonText = () => {
    if (!user) return 'Get Started';
    if (isFreePlanCurrent) return 'Current Plan';
    return 'Upgrade to Free';
  };

  const getProButtonText = () => {
    if (!user) return 'Get Started';
    if (isProPlanCurrent) return 'View Packages';
    return 'Explore More Packages';
  };

  if (loading) {
    return (
      <PageWrapper showFooter={false} className="min-h-screen" style={{ backgroundColor: 'var(--background-secondary)' }}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary-color)' }} />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper showFooter={true} className="min-h-screen px-4 py-8" style={{ backgroundColor: 'var(--background-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <h2 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: 'var(--foreground)' }}
          >
            Choose Your Plan
          </h2>
          <p 
            className="text-xl max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Start for free, upgrade when you need more power
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* FREE PLAN CARD */}
          <div
            className="relative rounded-2xl p-8 transition-all duration-300 hover:scale-105 shadow-lg"
            style={{
              backgroundColor: 'white',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: 'var(--border-light)'
            }}
          >
            {/* Current Plan Badge */}
            {isFreePlanCurrent && (
              <div className="absolute -top-4 right-4">
                <span 
                  className="px-3 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1"
                  style={{ 
                    backgroundColor: 'var(--success)',
                    color: 'white'
                  }}
                >
                  <Check className="w-3 h-3" />
                  Active
                </span>
              </div>
            )}

            {/* Plan Header */}
            <div className="mb-6">
              <h3 
                className="text-2xl font-bold mb-2 flex items-center gap-2"
                style={{ color: 'var(--foreground)' }}
              >
                <Sparkles className="w-6 h-6" style={{ color: 'var(--primary-color)' }} />
                Free Plan
              </h3>
              <div className="flex items-baseline gap-1 py-2">
                <span 
                  className="text-5xl font-bold"
                  style={{ color: 'var(--foreground)' }}
                >
                  Rs.0
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  per month
                </span>
              </div>
            </div>

            {/* Features List */}
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check 
                  className="w-5 h-5 flex-shrink-0 mt-0.5" 
                  style={{ color: 'var(--success)' }}
                />
                <div>
                  <span
                    className="text-sm font-semibold block"
                    style={{ color: 'var(--foreground)' }}
                  >
                    5 Email Generations
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    per month
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Check 
                  className="w-5 h-5 flex-shrink-0 mt-0.5" 
                  style={{ color: 'var(--success)' }}
                />
                <div>
                  <span
                    className="text-sm font-semibold block"
                    style={{ color: 'var(--foreground)' }}
                  >
                    100 Recipients per Email
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    send each email to up to 100 people
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Check 
                  className="w-5 h-5 flex-shrink-0 mt-0.5" 
                  style={{ color: 'var(--success)' }}
                />
                <div>
                  <span
                    className="text-sm font-semibold block"
                    style={{ color: 'var(--foreground)' }}
                  >
                    100 Sends per Day
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    daily sending limit
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Check 
                  className="w-5 h-5 flex-shrink-0 mt-0.5" 
                  style={{ color: 'var(--success)' }}
                />
                <span
                  className="text-sm"
                  style={{ color: 'var(--foreground)' }}
                >
                  AI-Powered Email Generation
                </span>
              </li>

              <li className="flex items-start gap-3">
                <Check 
                  className="w-5 h-5 flex-shrink-0 mt-0.5" 
                  style={{ color: 'var(--success)' }}
                />
                <span
                  className="text-sm"
                  style={{ color: 'var(--foreground)' }}
                >
                  Multiple AI Providers
                </span>
              </li>

              <li className="flex items-start gap-3">
                <X 
                  className="w-5 h-5 flex-shrink-0 mt-0.5" 
                  style={{ color: 'var(--error)' }}
                />
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Includes Branding
                </span>
              </li>
            </ul>

            {/* Action Button */}
            <button
              onClick={handleFreeAction}
              disabled={isFreePlanCurrent || upgrading === 'free'}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                isFreePlanCurrent
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:shadow-lg'
              } ${upgrading === 'free' ? 'opacity-50 cursor-wait' : ''}`}
              style={{
                backgroundColor: isFreePlanCurrent 
                  ? 'var(--gray-400)' 
                  : 'var(--primary-color)',
                color: 'white',
              }}
            >
              {upgrading === 'free' ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </span>
              ) : (
                getFreeButtonText()
              )}
            </button>
          </div>

          {/* PRO PLAN - STARTER PACKAGE CARD */}
          <div
            className="relative rounded-2xl p-8 transition-all duration-300 hover:scale-105 shadow-2xl"
            style={{
              backgroundColor: 'var(--primary-color)',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: 'var(--primary-hover)'
            }}
          >
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span 
                className="px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg"
                style={{ 
                  backgroundColor: 'var(--warning)',
                  color: 'white'
                }}
              >
                <Sparkles className="w-4 h-4" />
                Starter Package
              </span>
            </div>

            {/* Current Plan Badge */}
            {isProPlanCurrent && (
              <div className="absolute -top-4 right-4">
                <span 
                  className="px-3 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1"
                  style={{ 
                    backgroundColor: 'var(--success)',
                    color: 'white'
                  }}
                >
                  <Check className="w-3 h-3" />
                  Active
                </span>
              </div>
            )}

            {/* Plan Header */}
            <div className="mb-6">
              <h3 
                className="text-2xl font-bold mb-2 flex items-center gap-2 text-white"
              >
                <Crown className="w-6 h-6 text-yellow-300" />
                Pro - Starter
              </h3>
              <div className="flex items-baseline gap-1 py-2">
                <span 
                  className="text-5xl font-bold text-white"
                >
                  Rs.150
                </span>
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                  one-time
                </span>
              </div>
            </div>

            {/* Features List */}
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check 
                  className="w-5 h-5 flex-shrink-0 mt-0.5" 
                  style={{ color: '#86efac' }}
                />
                <div>
                  <span
                    className="text-sm font-semibold block text-white"
                  >
                    10 Email Generations
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    included in package
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Check 
                  className="w-5 h-5 flex-shrink-0 mt-0.5" 
                  style={{ color: '#86efac' }}
                />
                <div>
                  <span
                    className="text-sm font-semibold block text-white"
                  >
                    150 Recipients per Email
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    send each email to up to 150 people
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Check 
                  className="w-5 h-5 flex-shrink-0 mt-0.5" 
                  style={{ color: '#86efac' }}
                />
                <div>
                  <span
                    className="text-sm font-semibold block text-white"
                  >
                    200 Sends per Day
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    daily sending limit
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Check 
                  className="w-5 h-5 flex-shrink-0 mt-0.5" 
                  style={{ color: '#86efac' }}
                />
                <span
                  className="text-sm text-white"
                >
                  AI-Powered Email Generation
                </span>
              </li>

              <li className="flex items-start gap-3">
                <Check 
                  className="w-5 h-5 flex-shrink-0 mt-0.5" 
                  style={{ color: '#86efac' }}
                />
                <span
                  className="text-sm text-white"
                >
                  Multiple AI Providers
                </span>
              </li>

              <li className="flex items-start gap-3">
                <Check 
                  className="w-5 h-5 flex-shrink-0 mt-0.5" 
                  style={{ color: '#86efac' }}
                />
                <span
                  className="text-sm text-white"
                >
                  No Branding
                </span>
              </li>
            </ul>

            {/* Action Button */}
            <button
              onClick={handleExplorePackages}
              disabled={upgrading === 'pro' || !user}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                upgrading === 'pro' ? 'opacity-50 cursor-wait' : 'hover:shadow-lg'
              }`}
              style={{
                backgroundColor: 'white',
                color: 'var(--primary-color)',
              }}
            >
              {upgrading === 'pro' ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </span>
              ) : (
                getProButtonText()
              )}
            </button>

            {/* Info Text */}
            {!user && (
              <p className="text-center text-sm mt-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <button
                  onClick={() => router.push('/login')}
                  className="underline font-semibold hover:text-white"
                >
                  Sign in
                </button>
                {' '}to explore all packages
              </p>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-4">
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            All plans include access to multiple AI providers and email history
          </p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Looking for more?{' '}
            <LinkButton 
              href="/packages" 
              variant="text"
              className="font-medium"
              style={{ color: 'var(--primary-color)' }}
            >
              View all packages
            </LinkButton>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}