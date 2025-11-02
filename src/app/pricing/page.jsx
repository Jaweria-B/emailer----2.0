'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2, Sparkles, Zap } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { useAuthContext } from '@/providers/AuthProvider';

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
      {
        text: `${plan.personalized_email_limit} Personalized Emails/month`,
        included: plan.personalized_email_limit > 0,
        highlight: true
      },
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
      <PageWrapper showFooter={false} className="min-h-screen bg-gradient-to-br from-[#3c78fa] to-indigo-800">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper showFooter={true} className="min-h-screen bg-gradient-to-br from-[#3c78fa] to-indigo-800 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Start for free, upgrade when you need more power
          </p>
          
          {user && usage && (
            <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 max-w-md mx-auto">
              <p className="text-white font-semibold mb-2">Your Current Usage</p>
              <div className="text-sm text-purple-100 space-y-1">
                <p>Simple Emails: {usage.simple_emails_used}/{usage.simple_emails_limit}</p>
                <p>Personalized: {usage.personalized_emails_used}/{usage.personalized_emails_limit}</p>
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
                    ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-2 border-pink-400/50'
                    : 'bg-white/10 border-2 border-white/20'
                } backdrop-blur-lg`}
              >
                {/* Popular Badge */}
                {isPro && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                      <Sparkles className="w-4 h-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isPlanCurrent && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      ✓ Active
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    {plan.name}
                    {isPro && <Zap className="w-6 h-6 text-yellow-300" />}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-white">
                      ${parseFloat(plan.price).toFixed(0)}
                    </span>
                    <span className="text-purple-200">
                      /{plan.billing_cycle}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? 'text-white' : 'text-purple-300'
                        } ${feature.highlight ? 'font-semibold' : ''}`}
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
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                    isPlanCurrent
                      ? 'bg-gray-500 cursor-not-allowed opacity-60'
                      : isPro
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                      : 'bg-white/20 hover:bg-white/30 border border-white/30'
                  } ${upgrading === plan.id ? 'opacity-50 cursor-wait' : ''}`}
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
        <div className="text-center text-purple-100 space-y-4">
          <p className="text-lg">
            All plans include access to multiple AI providers and email history
          </p>
          <p className="text-sm text-purple-200">
            Need help choosing? {' '}
            <button 
              onClick={() => router.push('/contact')} 
              className="text-pink-300 hover:text-pink-200 underline"
            >
              Contact our team
            </button>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}