'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2, Sparkles, Zap, Crown } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { useAuthContext } from '@/providers/AuthProvider';
import Button from '@/components/button';
import LinkButton from '@/components/linkButton';

export default function PricingPage() {
  const router = useRouter();
  const { user, isLoadingUser } = useAuthContext();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (user && !isLoadingUser) {
      fetchCurrentSubscription();
    } else if (!isLoadingUser) {
      setLoading(false);
    }
  }, [user, isLoadingUser]);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans');
      const data = await response.json();
      
      if (data.success) {
        console.log('📦 Plans loaded:', data.plans);
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('❌ Error fetching plans:', error);
    }
  };

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

  const handlePlanAction = async (plan) => {
    console.log('🎯 Plan clicked:', plan.name);
    console.log('👤 User:', user);
    console.log('📋 Current plan:', currentSubscription?.plan_name);

    // If not authenticated, redirect to login
    if (!user) {
      console.log('🔒 User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    // If it's their current plan, go to settings
    if (currentSubscription?.plan_name === plan.name) {
      console.log('✅ Already on this plan, going to settings');
      router.push('/dashboard');
      return;
    }

    // If upgrading/downgrading to a different plan
    setUpgrading(plan.id);
    
    try {
      console.log('🚀 Upgrading to:', plan.name);
      const response = await fetch('/api/subscriptions/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: plan.id })
      });

      if (response.ok) {
        console.log('✅ Upgrade successful!');
        // Refresh subscription data
        await fetchCurrentSubscription();
        alert(`Successfully ${plan.price === "0.00" ? 'downgraded to' : 'upgraded to'} ${plan.name} plan!`);
      } else {
        const error = await response.json();
        console.error('❌ Upgrade failed:', error);
        alert(error.error || 'Failed to change plan');
      }
    } catch (error) {
      console.error('❌ Upgrade error:', error);
      alert('Failed to change plan. Please try again.');
    } finally {
      setUpgrading(null);
    }
  };

  const getPlanFeatures = (plan) => {
    return [
      {
        text: `${plan.simple_email_limit} Simple Emails/month`,
        included: plan.simple_email_limit > 0,
        highlight: true
      },
      // {
      //   text: `${plan.personalized_email_limit} Personalized Emails/month`,
      //   included: plan.personalized_email_limit > 0,
      //   highlight: true
      // },
      {
        text: plan.has_branding ? 'Includes OpenPromote Branding' : 'No Branding',
        included: !plan.has_branding
      },
      {
        text: 'AI-Powered Email Generation',
        included: true
      },
      {
        text: 'Multiple AI Providers',
        included: true
      },
      {
        text: 'Email History & Analytics',
        included: true
      },
      {
        text: 'Priority Support',
        included: plan.name !== 'Free'
      },
      {
        text: 'Advanced Templates',
        included: plan.name !== 'Free'
      }
    ];
  };

  const getButtonText = (plan) => {
    if (!user) {
      return 'Get Started';
    }
    
    if (currentSubscription?.plan_name === plan.name) {
      return 'Current Plan';
    }
    
    if (plan.name === 'Free') {
      return 'Downgrade to Free';
    }
    
    return 'Upgrade Now';
  };

  const isCurrentPlan = (plan) => {
    const isCurrent = currentSubscription?.plan_name === plan.name;
    console.log(`🔍 Checking if ${plan.name} is current:`, isCurrent);
    return isCurrent;
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
          
          {user && usage && (
            <div 
              className="mt-6 rounded-xl border p-4 max-w-md mx-auto shadow-md"
              style={{ 
                backgroundColor: 'var(--primary-lightest)',
                borderColor: 'var(--primary-lighter)'
              }}
            >
              <p className="font-semibold mb-2" style={{ color: 'var(--primary-active)' }}>
                Your Current Usage
              </p>
              <div className="text-sm space-y-1" style={{ color: 'var(--primary-active)' }}>
                <p>Simple Emails: {usage.simple_emails_used}/{usage.simple_emails_limit}</p>
                {/* <p>Personalized: {usage.personalized_emails_used}/{usage.personalized_emails_limit}</p> */}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {plans.map((plan) => {
            const isPlanCurrent = isCurrentPlan(plan);
            const isPro = plan.name === 'Pro';
            const features = getPlanFeatures(plan);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-105 ${
                  isPro
                    ? 'shadow-2xl'
                    : 'shadow-lg'
                }`}
                style={{
                  backgroundColor: isPro ? 'var(--primary-color)' : 'white',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: isPro ? 'var(--primary-hover)' : 'var(--border-light)'
                }}
              >
                {/* Popular Badge */}
                {isPro && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span 
                      className="px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg"
                      style={{ 
                        backgroundColor: 'var(--warning)',
                        color: 'white'
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isPlanCurrent && (
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
                    style={{ color: isPro ? 'white' : 'var(--foreground)' }}
                  >
                    {plan.name}
                    {isPro && <Crown className="w-6 h-6 text-yellow-300" />}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span 
                      className="text-5xl font-bold"
                      style={{ color: isPro ? 'white' : 'var(--foreground)' }}
                    >
                      ${parseFloat(plan.price).toFixed(0)}
                    </span>
                    <span style={{ color: isPro ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
                      /{plan.billing_cycle}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check 
                          className="w-5 h-5 flex-shrink-0 mt-0.5" 
                          style={{ color: isPro ? '#86efac' : 'var(--success)' }}
                        />
                      ) : (
                        <X 
                          className="w-5 h-5 flex-shrink-0 mt-0.5" 
                          style={{ color: isPro ? 'rgba(255,255,255,0.5)' : 'var(--error)' }}
                        />
                      )}
                      <span
                        className={`text-sm ${feature.highlight ? 'font-semibold' : ''}`}
                        style={{ 
                          color: feature.included 
                            ? (isPro ? 'white' : 'var(--foreground)') 
                            : (isPro ? 'rgba(255,255,255,0.6)' : 'var(--text-tertiary)')
                        }}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button
                  onClick={() => handlePlanAction(plan)}
                  disabled={isPlanCurrent || upgrading === plan.id}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                    isPlanCurrent
                      ? 'opacity-60 cursor-not-allowed'
                      : 'hover:shadow-lg'
                  } ${upgrading === plan.id ? 'opacity-50 cursor-wait' : ''}`}
                  style={{
                    backgroundColor: isPlanCurrent 
                      ? 'var(--gray-400)' 
                      : isPro 
                      ? 'white' 
                      : 'var(--primary-color)',
                    color: isPlanCurrent 
                      ? 'white' 
                      : isPro 
                      ? 'var(--primary-color)' 
                      : 'white',
                    borderWidth: isPro ? '0' : '2px',
                    borderStyle: 'solid',
                    borderColor: isPro ? 'transparent' : 'var(--primary-hover)'
                  }}
                >
                  {upgrading === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    getButtonText(plan)
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-4">
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            All plans include access to multiple AI providers and email history
          </p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Need help choosing?{' '}
            <LinkButton 
              href="/contact" 
              variant="text"
              className="font-medium"
              style={{ color: 'var(--primary-color)' }}
            >
              Contact our team
            </LinkButton>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}