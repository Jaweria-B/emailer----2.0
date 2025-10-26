"use client"
import React from 'react';
import { TrendingUp, Zap, Crown, AlertCircle } from 'lucide-react';

const UsageWidget = ({ usage, subscription, onUpgradeClick }) => {
  if (!usage || !subscription) return null;

  const simplePercentage = (usage.simple_emails_used / usage.simple_email_limit) * 100;
  const personalizedPercentage = usage.personalized_email_limit > 0 
    ? (usage.personalized_emails_used / usage.personalized_email_limit) * 100 
    : 0;

  const isApproachingLimit = usage.simple_emails_remaining <= 5 || 
    (usage.personalized_email_limit > 0 && usage.personalized_emails_remaining <= 5);

  const isPro = subscription.plan_name?.toLowerCase() === 'pro';

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-300" />
          <h3 className="text-lg font-semibold text-white">Your Usage</h3>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
          isPro 
            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
            : 'bg-white/10 border border-white/20'
        }`}>
          {isPro ? <Crown className="h-4 w-4 text-yellow-400" /> : <Zap className="h-4 w-4 text-purple-300" />}
          <span className="text-sm font-medium text-white">{subscription.plan_name}</span>
        </div>
      </div>

      {/* Warning Banner */}
      {isApproachingLimit && (
        <div className="mb-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-xl flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-orange-300 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-orange-200">
            <p className="font-medium">Running low on emails!</p>
            <p className="text-xs mt-1">Consider upgrading to continue generating emails.</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Simple Emails */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-purple-200">Simple Emails</span>
            <span className="text-white font-medium">
              {usage.simple_emails_used} / {usage.simple_email_limit}
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                simplePercentage >= 90 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                  : simplePercentage >= 70
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-green-500 to-blue-500'
              }`}
              style={{ width: `${Math.min(simplePercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-purple-300 mt-1">
            {usage.simple_emails_remaining} emails remaining
          </p>
        </div>

        {/* Personalized Emails */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-purple-200">Personalized Emails</span>
            <span className="text-white font-medium">
              {usage.personalized_emails_used} / {usage.personalized_email_limit || 0}
            </span>
          </div>
          {usage.personalized_email_limit > 0 ? (
            <>
              <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    personalizedPercentage >= 90 
                      ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                      : personalizedPercentage >= 70
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}
                  style={{ width: `${Math.min(personalizedPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-purple-300 mt-1">
                {usage.personalized_emails_remaining} emails remaining
              </p>
            </>
          ) : (
            <div className="bg-white/10 rounded-lg p-3 border border-white/20">
              <p className="text-xs text-purple-300 text-center">
                Upgrade to Pro to unlock personalized emails
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Button for Free Users */}
      {!isPro && (
        <button
          onClick={onUpgradeClick}
          className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Crown className="h-4 w-4" />
          Upgrade to Pro
        </button>
      )}

      {/* Period Info */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-xs text-purple-300 text-center">
          Resets on {new Date(subscription.current_period_end).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default UsageWidget;