"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, User, Calendar, Activity, LogOut, MessageSquare, 
  TrendingUp, Zap, AlertTriangle, Crown, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/AuthProvider';
import PageWrapper from '@/components/PageWrapper';
import Button from '@/components/button';
import LinkButton from '@/components/linkButton';

const Dashboard = () => {
  const { user, isLoadingUser, handleLogout: contextLogout } = useAuthContext();
  const [emailHistory, setEmailHistory] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [stats, setStats] = useState({
    totalEmails: 0,
    emailsThisMonth: 0,
    favoriteProvider: '',
    mostUsedTone: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const calculateStats = useCallback((emails) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const emailsThisMonth = emails.filter(email => {
      const emailDate = new Date(email.created_at);
      return emailDate.getMonth() === currentMonth && emailDate.getFullYear() === currentYear;
    }).length;

    const providerCount = {};
    const toneCount = {};
    
    emails.forEach(email => {
      providerCount[email.ai_provider] = (providerCount[email.ai_provider] || 0) + 1;
      toneCount[email.tone] = (toneCount[email.tone] || 0) + 1;
    });

    const favoriteProvider = Object.keys(providerCount).reduce((a, b) => 
      providerCount[a] > providerCount[b] ? a : b, ''
    );

    const mostUsedTone = Object.keys(toneCount).reduce((a, b) => 
      toneCount[a] > toneCount[b] ? a : b, ''
    );

    setStats({
      totalEmails: emails.length,
      emailsThisMonth,
      favoriteProvider,
      mostUsedTone
    });
  }, []);

  const loadEmailHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/email-history');
      if (response.ok) {
        const data = await response.json();
        setEmailHistory(data.emails);
        calculateStats(data.emails);
      }
    } catch (error) {
      console.error('Failed to load email history:', error);
    }
  }, [calculateStats]);

  const loadSubscriptionData = useCallback(async () => {
    try {
      const response = await fetch('/api/subscriptions/current');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data.subscription);
        setUsageData(data.usage);
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    }
  }, []);

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push('/login');
    }
  }, [user, isLoadingUser, router]);

  useEffect(() => {
    if (user) {
      Promise.all([loadEmailHistory(), loadSubscriptionData()])
        .finally(() => setIsLoading(false));
    }
  }, [user, loadEmailHistory, loadSubscriptionData]);

  const handleLogout = async () => {
    await contextLogout();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUsagePercentage = (used, limit) => {
    if (limit === 0) return 0;
    return Math.round((used / limit) * 100);
  };

  const shouldShowWarning = (remaining, limit) => {
    if (limit === 0) return false;
    const percentage = (remaining / limit) * 100;
    return percentage <= 20 || remaining <= 5;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background-secondary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--primary-color)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const simplePercentage = usageData ? getUsagePercentage(usageData.simple_emails_used, usageData.simple_emails_limit) : 0;
  const personalizedPercentage = usageData ? getUsagePercentage(usageData.personalized_emails_used, usageData.personalized_emails_limit) : 0;
  const showSimpleWarning = usageData ? shouldShowWarning(usageData.simple_emails_remaining, usageData.simple_emails_limit) : false;
  const showPersonalizedWarning = usageData ? shouldShowWarning(usageData.personalized_emails_remaining, usageData.personalized_emails_limit) : false;

  return (
    <PageWrapper>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background-secondary)' }}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 md:gap-4">
              <div 
                className="rounded-full p-2 md:p-3 shadow-md"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <User className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-sm md:text-base truncate max-w-[200px] md:max-w-none" style={{ color: 'var(--text-secondary)' }}>
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2 md:gap-3">
              <Button
                onClick={() => router.push('/')}
                variant="primary"
                icon={<MessageSquare className="h-4 w-4 md:h-5 md:w-5" />}
                className="text-sm md:text-base"
              >
                <span className="">Create Email</span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                icon={<LogOut className="h-4 w-4" />}
                className="text-sm md:text-base"
              >
                <span className="">Sign Out</span>
              </Button>
            </div>
          </div>

          {/* Warning Banners */}
          {/* {(showSimpleWarning || showPersonalizedWarning || (usageData && usageData.personalized_emails_limit === 0)) && (
            <div className="mb-4 sm:mb-6 space-y-3">
              {showSimpleWarning && usageData.simple_emails_remaining > 0 && (
                <div 
                  className="rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                  style={{ 
                    backgroundColor: 'var(--warning-light)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--warning)'
                  }}
                >
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--warning)' }} />
                  <div className="flex-1">
                    <p className="font-medium text-sm sm:text-base" style={{ color: 'var(--warning)' }}>
                      Running low on simple emails! Only {usageData.simple_emails_remaining} remaining this month.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/pricing')}
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Upgrade Now
                  </Button>
                </div>
              )}
              
              {usageData && usageData.simple_emails_remaining === 0 && (
                <div 
                  className="rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                  style={{ 
                    backgroundColor: 'var(--error-light)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--error)'
                  }}
                >
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--error)' }} />
                  <div className="flex-1">
                    <p className="font-medium text-sm sm:text-base" style={{ color: 'var(--error)' }}>
                      You've reached your simple email limit for this month!
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/pricing')}
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Upgrade Now
                  </Button>
                </div>
              )}

              {usageData && usageData.personalized_emails_limit === 0 && subscriptionData?.plan_name === 'Free' && (
                <div 
                  className="rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                  style={{ 
                    backgroundColor: 'var(--primary-lightest)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--primary-lighter)'
                  }}
                >
                  <Crown className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--primary-color)' }} />
                  <div className="flex-1">
                    <p className="font-medium text-sm sm:text-base" style={{ color: 'var(--primary-active)' }}>
                      Upgrade to Pro to unlock 100 personalized emails per month!
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/pricing')}
                    variant="primary"
                    icon={<Crown className="h-4 w-4" />}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Go Pro
                  </Button>
                </div>
              )}
            </div>
          )} */}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Simple Emails Card */}
            <div className="bg-white rounded-xl border shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--primary-lightest)' }}>
                  <Mail className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: 'var(--primary-color)' }} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Simple Emails
                  </p>
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {usageData ? `${usageData.simple_emails_used}/${usageData.simple_emails_limit}` : '0/0'}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3" style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--border-light)' }}>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {usageData ? `${usageData.simple_emails_remaining} remaining` : 'No data'}
                </p>
              </div>
            </div>

            {/* Personalized Emails Card - Commented out but keeping structure */}
            {/* <div className="bg-white rounded-xl border shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
                  <Zap className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Personalized
                  </p>
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {usageData ? `${usageData.personalized_emails_used}/${usageData.personalized_emails_limit}` : '0/0'}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3" style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--border-light)' }}>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {usageData ? `${usageData.personalized_emails_remaining} remaining` : 'No data'}
                </p>
              </div>
            </div> */}

            {/* Current Plan Card */}
            <div className="bg-white rounded-xl border shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f3e8ff' }}>
                  <Crown className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: '#9333ea' }} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Current Plan
                  </p>
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {subscriptionData?.plan_name || 'Free'}
                  </p>
                </div>
              </div>
              {subscriptionData?.plan_name === 'Free' && (
                <div className="mt-3 pt-3" style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--border-light)' }}>
                  <LinkButton
                    href="/pricing"
                    variant="text"
                    className="text-xs font-medium"
                    style={{ color: 'var(--primary-color)' }}
                    iconRight={<ArrowRight className="h-3 w-3" />}
                  >
                    Upgrade to Pro
                  </LinkButton>
                </div>
              )}
            </div>

            {/* This Month Card */}
            <div className="bg-white rounded-xl border shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#d1fae5' }}>
                  <Calendar className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: '#10b981' }} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    This Month
                  </p>
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {stats.emailsThisMonth}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3" style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--border-light)' }}>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Emails generated
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Overview */}
          <div className="bg-white rounded-xl border shadow-lg p-4 sm:p-6 mb-6 sm:mb-8" style={{ borderColor: 'var(--border-light)' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
                <Activity className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: 'var(--primary-color)' }} />
                Subscription Overview
              </h2>
              <Button
                onClick={() => router.push('/pricing')}
                variant="primary"
                size="sm"
                iconRight={<ArrowRight className="h-4 w-4" />}
                className="w-full sm:w-auto"
              >
                View Plans
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 sm:gap-6">
              {/* Simple Emails Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                    Simple Emails
                  </span>
                  <span className="font-bold text-sm sm:text-base" style={{ color: 'var(--foreground)' }}>
                    {usageData ? `${usageData.simple_emails_used} / ${usageData.simple_emails_limit}` : '0 / 0'}
                  </span>
                </div>
                <div className="rounded-full h-2 sm:h-3 overflow-hidden" style={{ backgroundColor: 'var(--gray-200)' }}>
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{ 
                      width: `${Math.min(simplePercentage, 100)}%`,
                      backgroundColor: simplePercentage >= 80 ? 'var(--error)' : simplePercentage >= 50 ? 'var(--warning)' : 'var(--success)'
                    }}
                  />
                </div>
                <p className="text-xs sm:text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>
                  {usageData ? `${usageData.simple_emails_remaining} remaining` : 'No limit data'}
                </p>
              </div>

              {/* Personalized Emails Progress - Commented out */}
              {/* <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                    Personalized Emails
                  </span>
                  <span className="font-bold text-sm sm:text-base" style={{ color: 'var(--foreground)' }}>
                    {usageData ? `${usageData.personalized_emails_used} / ${usageData.personalized_emails_limit}` : '0 / 0'}
                  </span>
                </div>
                <div className="rounded-full h-2 sm:h-3 overflow-hidden" style={{ backgroundColor: 'var(--gray-200)' }}>
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{ 
                      width: usageData && usageData.personalized_emails_limit === 0 ? '0%' : `${Math.min(personalizedPercentage, 100)}%`,
                      backgroundColor: usageData && usageData.personalized_emails_limit === 0 
                        ? 'var(--gray-400)' 
                        : personalizedPercentage >= 80 
                        ? 'var(--error)' 
                        : personalizedPercentage >= 50 
                        ? 'var(--warning)' 
                        : 'var(--success)'
                    }}
                  />
                </div>
                {usageData && usageData.personalized_emails_limit === 0 ? (
                  <p className="text-xs sm:text-sm mt-2 flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                    <Crown className="h-3 w-3" />
                    Upgrade to Pro to unlock
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>
                    {usageData ? `${usageData.personalized_emails_remaining} remaining` : 'No limit data'}
                  </p>
                )}
              </div> */}
            </div>

            {/* Plan Details */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6" style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--border-light)' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Billing Period
                  </p>
                  <p className="font-medium text-sm sm:text-base" style={{ color: 'var(--foreground)' }}>
                    Resets on {usageData ? new Date(usageData.period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
                {subscriptionData?.plan_name === 'Free' && (
                  <Button
                    onClick={() => router.push('/pricing')}
                    variant="primary"
                    icon={<Crown className="h-4 w-4 sm:h-5 sm:w-5" />}
                    className="w-full sm:w-auto"
                  >
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Email History */}
          <div className="bg-white rounded-xl border shadow-lg p-6" style={{ borderColor: 'var(--border-light)' }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
              <Mail className="h-6 w-6" style={{ color: 'var(--primary-color)' }} />
              Recent Emails
            </h2>

            {emailHistory.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {emailHistory.map((email) => (
                  <div 
                    key={email.id} 
                    className="rounded-lg p-4 border hover:shadow-md transition-shadow"
                    style={{ 
                      backgroundColor: 'var(--background-secondary)',
                      borderColor: 'var(--border-light)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-1" style={{ color: 'var(--foreground)' }}>
                          {email.email_subject || 'Untitled Email'}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: 'var(--primary-lightest)',
                              color: 'var(--primary-active)'
                            }}
                          >
                            {email.tone}
                          </span>
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: '#dbeafe',
                              color: '#1e40af'
                            }}
                          >
                            {email.ai_provider}
                          </span>
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: 'var(--success-light)',
                              color: 'var(--success)'
                            }}
                          >
                            {email.status}
                          </span>
                        </div>
                        {email.recipient && (
                          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                            To: {email.recipient}
                          </p>
                        )}
                      </div>
                      <div className="text-sm whitespace-nowrap ml-4" style={{ color: 'var(--text-tertiary)' }}>
                        {formatDate(email.created_at)}
                      </div>
                    </div>
                    
                    {email.email_body && (
                      <div className="rounded-lg p-3 mt-3" style={{ backgroundColor: 'var(--background)' }}>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {email.email_body.length > 200 
                            ? email.email_body.substring(0, 200) + '...' 
                            : email.email_body
                          }
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Mail className="h-16 w-16 mx-auto mb-4 opacity-30" style={{ color: 'var(--text-tertiary)' }} />
                <p className="text-lg mb-1" style={{ color: 'var(--foreground)' }}>
                  No emails generated yet
                </p>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Start creating your first email!
                </p>
                <Button
                  onClick={() => router.push('/')}
                  variant="primary"
                  icon={<MessageSquare className="h-5 w-5" />}
                >
                  Create First Email
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;