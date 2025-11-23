"use client"
import React from 'react';
import { TrendingUp, Crown, AlertCircle, Wallet } from 'lucide-react';

const UsageWidget = ({ usage, subscription, onUpgradeClick }) => {
  if (!usage || !subscription) return null;

  const isFree = usage.plan_type === 'free';
  const isPro = usage.plan_type === 'pro';

  // FREE PLAN UI
  if (isFree) {
    const generationPercentage = (usage.generations_used / usage.generations_limit) * 100;
    const sendPercentage = usage.sends_limit > 0 
      ? (usage.sends_used / usage.sends_limit) * 100 
      : 0;

    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-300" />
            <h3 className="text-lg font-semibold text-white">Your Usage</h3>
          </div>
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full text-white">
            FREE
          </span>
        </div>

        {/* Generations */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-purple-200">Email Generations</span>
            <span className="text-sm font-semibold text-white">
              {usage.generations_used} / {usage.generations_limit}
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                generationPercentage >= 80 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                  : generationPercentage >= 60
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-green-500 to-blue-500'
              }`}
              style={{ width: `${Math.min(generationPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-purple-300 mt-1">
            {usage.generations_remaining} generations remaining
          </p>
        </div>

        {/* Sends */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-purple-200">Email Sends</span>
            <span className="text-sm font-semibold text-white">
              {usage.sends_used} / {usage.sends_limit}
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                sendPercentage >= 80 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                  : sendPercentage >= 60
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}
              style={{ width: `${Math.min(sendPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-purple-300 mt-1">
            {usage.sends_remaining} sends remaining ({usage.sends_per_generation} per email)
          </p>
        </div>

        {/* Warning if low */}
        {(usage.generations_remaining <= 1 || usage.sends_remaining <= 5) && (
          <div className="mb-4 bg-orange-500/20 border border-orange-500/30 rounded-lg p-3">
            <p className="text-xs text-orange-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Running low! Upgrade to Pro for unlimited usage.
            </p>
          </div>
        )}

        <button
          onClick={onUpgradeClick}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Crown className="h-4 w-4" />
          Upgrade to Pro
        </button>

        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-xs text-purple-300 text-center">
            Resets on {new Date(usage.period_end).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  // PRO PLAN UI
  if (isPro) {
    const isLowBalance = usage.wallet_balance < 100;
    
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-yellow-500/30 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Pro Plan</h3>
          </div>
          <span className="text-xs bg-yellow-500/20 px-2 py-1 rounded-full text-yellow-300 border border-yellow-500/30">
            PRO
          </span>
        </div>

        {/* Wallet Balance */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-white">Wallet Balance</span>
            </div>
            <span className="text-2xl font-bold text-yellow-400">
              {usage.currency} {usage.wallet_balance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-purple-200">Generation Cost:</span>
            <span className="text-white font-semibold">
              {usage.currency} {usage.price_per_generation}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-purple-200">Send Cost (per recipient):</span>
            <span className="text-white font-semibold">
              {usage.currency} {usage.price_per_send}
            </span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-white/20">
            <span className="text-purple-200">Total Spent This Period:</span>
            <span className="text-white font-semibold">
              {usage.currency} {usage.total_spent.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Low Balance Warning */}
        {isLowBalance && (
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 mb-3">
            <p className="text-xs text-orange-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Low balance! Add credits to continue using the service.
            </p>
          </div>
        )}

        {/* Buy Credits Button */}
        <button
          onClick={() => window.location.href = '/bundles'}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Wallet className="h-4 w-4" />
          Buy Credits
        </button>

        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-xs text-purple-300 text-center">
            Period ends {new Date(usage.period_end).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default UsageWidget;