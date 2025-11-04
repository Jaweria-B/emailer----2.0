"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, User, Calendar, Activity, LogOut, MessageSquare, 
  TrendingUp, Zap, AlertTriangle, Crown, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/AuthProvider';
import PageWrapper from '@/components/PageWrapper';

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
      <div className="min-h-screen bg-gradient-to-br from-[#667EEA] to-indigo-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-[#667EEA] to-indigo-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-white/20 backdrop-blur-lg rounded-full p-2 md:p-3 border border-white/30">
                <User className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-xl md:text-3xl font-bold">Welcome back, {user?.name}!</h1>
                <p className="text-sm md:text-base text-purple-200 truncate max-w-[200px] md:max-w-none">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium text-sm md:text-base"
              >
                <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                <span className="">Create Email</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-white/20 backdrop-blur-lg text-white px-3 md:px-4 py-2 md:py-3 rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-2 text-sm md:text-base"
              >
                <LogOut className="h-4 w-4" />
                <span className="">Sign Out</span>
              </button>
            </div>
          </div>
          {/* Warning Banners */}
          {(showSimpleWarning || showPersonalizedWarning || (usageData && usageData.personalized_emails_limit === 0)) && (
            <div className="mb-4 sm:mb-6 space-y-3">
              {showSimpleWarning && usageData.simple_emails_remaining > 0 && (
                <div className="bg-yellow-500/20 backdrop-blur-lg border border-yellow-500/40 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-300 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-yellow-100 font-medium text-sm sm:text-base">
                      Running low on simple emails! Only {usageData.simple_emails_remaining} remaining this month.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/pricing')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm w-full sm:w-auto"
                  >
                    Upgrade Now
                  </button>
                </div>
              )}
              
              {usageData && usageData.simple_emails_remaining === 0 && (
                <div className="bg-red-500/20 backdrop-blur-lg border border-red-500/40 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-300 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-100 font-medium text-sm sm:text-base">
                      You've reached your simple email limit for this month!
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/pricing')}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm w-full sm:w-auto"
                  >
                    Upgrade Now
                  </button>
                </div>
              )}

              {usageData && usageData.personalized_emails_limit === 0 && subscriptionData?.plan_name === 'Free' && (
                <div className="bg-blue-500/20 backdrop-blur-lg border border-blue-500/40 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Crown className="h-5 w-5 text-blue-300 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-blue-100 font-medium text-sm sm:text-base">
                      Upgrade to Pro to unlock 100 personalized emails per month!
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/pricing')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                  >
                    <Crown className="h-4 w-4" />
                    Go Pro
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Simple Emails Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-blue-300" />
                <div>
                  <p className="text-purple-200 text-xs sm:text-sm">Simple Emails</p>
                  <p className="text-white text-xl sm:text-2xl font-bold">
                    {usageData ? `${usageData.simple_emails_used}/${usageData.simple_emails_limit}` : '0/0'}
                  </p>
                </div>
              </div>
            </div>

            {/* Personalized Emails Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-300" />
                <div>
                  <p className="text-purple-200 text-xs sm:text-sm">Personalized</p>
                  <p className="text-white text-xl sm:text-2xl font-bold">
                    {usageData ? `${usageData.personalized_emails_used}/${usageData.personalized_emails_limit}` : '0/0'}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Plan Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-purple-300" />
                <div>
                  <p className="text-purple-200 text-xs sm:text-sm">Current Plan</p>
                  <p className="text-white text-xl sm:text-2xl font-bold">{subscriptionData?.plan_name || 'Free'}</p>
                </div>
              </div>
            </div>

            {/* This Month Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-300" />
                <div>
                  <p className="text-purple-200 text-xs sm:text-sm">This Month</p>
                  <p className="text-white text-xl sm:text-2xl font-bold">{stats.emailsThisMonth}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Overview */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
                Subscription Overview
              </h2>
              <button
                onClick={() => router.push('/pricing')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm w-full sm:w-auto justify-center"
              >
                View Plans
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Simple Emails Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-200 font-medium text-sm sm:text-base">Simple Emails</span>
                  <span className="text-white font-bold text-sm sm:text-base">
                    {usageData ? `${usageData.simple_emails_used} / ${usageData.simple_emails_limit}` : '0 / 0'}
                  </span>
                </div>
                <div className="bg-white/10 rounded-full h-2 sm:h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      simplePercentage >= 80 ? 'bg-red-500' : simplePercentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(simplePercentage, 100)}%` }}
                  />
                </div>
                <p className="text-purple-300 text-xs sm:text-sm mt-2">
                  {usageData ? `${usageData.simple_emails_remaining} remaining` : 'No limit data'}
                </p>
              </div>

              {/* Personalized Emails Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-200 font-medium text-sm sm:text-base">Personalized Emails</span>
                  <span className="text-white font-bold text-sm sm:text-base">
                    {usageData ? `${usageData.personalized_emails_used} / ${usageData.personalized_emails_limit}` : '0 / 0'}
                  </span>
                </div>
                <div className="bg-white/10 rounded-full h-2 sm:h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      usageData && usageData.personalized_emails_limit === 0 
                        ? 'bg-gray-500' 
                        : personalizedPercentage >= 80 
                        ? 'bg-red-500' 
                        : personalizedPercentage >= 50 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ width: usageData && usageData.personalized_emails_limit === 0 ? '0%' : `${Math.min(personalizedPercentage, 100)}%` }}
                  />
                </div>
                {usageData && usageData.personalized_emails_limit === 0 ? (
                  <p className="text-purple-300 text-xs sm:text-sm mt-2 flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Upgrade to Pro to unlock
                  </p>
                ) : (
                  <p className="text-purple-300 text-xs sm:text-sm mt-2">
                    {usageData ? `${usageData.personalized_emails_remaining} remaining` : 'No limit data'}
                  </p>
                )}
              </div>
            </div>

            {/* Plan Details */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-purple-200 text-xs sm:text-sm mb-1">Billing Period</p>
                  <p className="text-white font-medium text-sm sm:text-base">
                    Resets on {usageData ? new Date(usageData.period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
                {subscriptionData?.plan_name === 'Free' && (
                  <button
                    onClick={() => router.push('/pricing')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
                  >
                    <Crown className="h-4 w-4 sm:h-5 sm:w-5" />
                    Upgrade to Pro
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* Email History */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Mail className="h-6 w-6" />
              Recent Emails
            </h2>

            {emailHistory.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {emailHistory.map((email) => (
                  <div key={email.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-lg mb-1">
                          {email.email_subject || 'Untitled Email'}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="bg-purple-500/30 text-purple-200 px-2 py-1 rounded-full text-xs">
                            {email.tone}
                          </span>
                          <span className="bg-blue-500/30 text-blue-200 px-2 py-1 rounded-full text-xs">
                            {email.ai_provider}
                          </span>
                          <span className="bg-green-500/30 text-green-200 px-2 py-1 rounded-full text-xs">
                            {email.status}
                          </span>
                        </div>
                        {email.recipient && (
                          <p className="text-purple-200 text-sm mb-2">
                            To: {email.recipient}
                          </p>
                        )}
                      </div>
                      <div className="text-purple-300 text-sm whitespace-nowrap ml-4">
                        {formatDate(email.created_at)}
                      </div>
                    </div>
                    
                    {email.email_body && (
                      <div className="bg-white/10 rounded-lg p-3 mt-3">
                        <p className="text-purple-100 text-sm leading-relaxed">
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
                <Mail className="h-16 w-16 text-purple-300 mx-auto mb-4 opacity-50" />
                <p className="text-purple-200 text-lg">No emails generated yet</p>
                <p className="text-purple-300 text-sm">Start creating your first email!</p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-2 rounded-xl transition-all duration-300"
                >
                  Create First Email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;