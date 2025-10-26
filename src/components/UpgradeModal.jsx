"use client"
import React from 'react';
import { X, Crown, Check, Zap, Star, Mail, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

const UpgradeModal = ({ isOpen, onClose, limitType = 'simple' }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgradeClick = () => {
    router.push('/pricing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-900/95 to-indigo-900/95 backdrop-blur-xl border-b border-white/20 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Upgrade to Pro</h2>
              <p className="text-purple-200 text-sm">Unlock unlimited email generation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Limit Reached Message */}
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-red-300 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold mb-1">
                  {limitType === 'simple' 
                    ? 'Simple Email Limit Reached' 
                    : 'Personalized Email Limit Reached'}
                </h3>
                <p className="text-red-200 text-sm">
                  You've used all your {limitType === 'simple' ? 'simple' : 'personalized'} emails 
                  for this billing period.
                </p>
              </div>
            </div>
          </div>

          {/* Pro Plan Benefits */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">Pro Plan Benefits</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-green-500/20 rounded-lg mt-0.5">
                  <Check className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">250 Simple Emails/month</p>
                  <p className="text-purple-200 text-sm">5x more than free plan</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 bg-green-500/20 rounded-lg mt-0.5">
                  <Check className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">100 Personalized Emails/month</p>
                  <p className="text-purple-200 text-sm">AI-powered bulk email campaigns</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 bg-green-500/20 rounded-lg mt-0.5">
                  <Check className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">No Branding</p>
                  <p className="text-purple-200 text-sm">Professional emails without "Powered by" footer</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 bg-green-500/20 rounded-lg mt-0.5">
                  <Check className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Priority Support</p>
                  <p className="text-purple-200 text-sm">Get help when you need it</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 bg-green-500/20 rounded-lg mt-0.5">
                  <Check className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Advanced AI Features</p>
                  <p className="text-purple-200 text-sm">Access to premium AI models</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl p-6 text-center">
            <div className="inline-flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold text-white">$50</span>
              <span className="text-purple-200">/month</span>
            </div>
            <p className="text-purple-200 text-sm">
              Cancel anytime • No hidden fees
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpgradeClick}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              <Crown className="h-5 w-5" />
              Upgrade to Pro Now
            </button>
            <button
              onClick={onClose}
              className="sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 border border-white/20"
            >
              Maybe Later
            </button>
          </div>

          <p className="text-center text-purple-300 text-xs">
            💡 Your current usage will be preserved after upgrading
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;