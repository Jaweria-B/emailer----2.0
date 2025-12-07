"use client"
import React from 'react';
import { X, Crown, Check, Zap, Star, Mail, Package as PackageIcon, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from './button';

const UpgradeModal = ({ isOpen, onClose, userPlan = 'Free', hasPackage = false }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleAction = () => {
    if (userPlan === 'Free') {
      // Free user → go to pricing
      router.push('/pricing');
    } else if (userPlan === 'Pro' && !hasPackage) {
      // Pro user without package → go to packages
      router.push('/packages');
    }
    onClose();
  };

  // ========== SCENARIO 1: Free User (Upgrade to Pro) ==========
  if (userPlan === 'Free') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
        <div 
          className="rounded-3xl border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          style={{ 
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }}
        >
          {/* Header */}
          <div className="sticky top-0 p-6 flex items-center justify-between" style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}
              >
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Upgrade to Pro</h2>
                <p className="text-sm text-white opacity-90">Unlock package-based email generation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-colors"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Limit Reached Message */}
            <div 
              className="rounded-xl p-4 border"
              style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: 'rgba(239, 68, 68, 0.3)'
              }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-200 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Free Plan Limit Reached
                  </h3>
                  <p className="text-red-100 text-sm">
                    You've used all your free email generations for this month. Upgrade to Pro for unlimited access!
                  </p>
                </div>
              </div>
            </div>

            {/* Pro Plan Benefits */}
            <div 
              className="rounded-2xl border p-6"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-yellow-300" />
                <h3 className="text-xl font-bold text-white">Pro Plan Benefits</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div 
                    className="p-1 rounded-lg mt-0.5"
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                  >
                    <Check className="h-4 w-4 text-green-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Access to Packages</p>
                    <p className="text-purple-100 text-sm">Purchase packages with 100-500 generations each</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div 
                    className="p-1 rounded-lg mt-0.5"
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                  >
                    <Check className="h-4 w-4 text-green-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Bulk Email Sending</p>
                    <p className="text-purple-100 text-sm">Send each email to up to 1200 recipients</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div 
                    className="p-1 rounded-lg mt-0.5"
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                  >
                    <Check className="h-4 w-4 text-green-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Daily Send Limit: 200</p>
                    <p className="text-purple-100 text-sm">Send up to 200 emails per day</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div 
                    className="p-1 rounded-lg mt-0.5"
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                  >
                    <Check className="h-4 w-4 text-green-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">No Branding</p>
                    <p className="text-purple-100 text-sm">Professional emails without "Powered by" footer</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div 
                    className="p-1 rounded-lg mt-0.5"
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                  >
                    <Check className="h-4 w-4 text-green-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Priority Support</p>
                    <p className="text-purple-100 text-sm">Get help when you need it</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div 
              className="rounded-2xl p-6 text-center border"
              style={{ 
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                borderColor: 'rgba(236, 72, 153, 0.3)'
              }}
            >
              <div className="inline-flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-white">Rs.50</span>
                <span className="text-purple-100">/month</span>
              </div>
              <p className="text-purple-100 text-sm">
                Cancel anytime • No hidden fees
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAction}
                variant="primary"
                className="flex-1"
                icon={<Crown className="h-5 w-5" />}
                style={{
                  backgroundColor: 'white',
                  color: 'var(--primary-color)'
                }}
              >
                Upgrade to Pro Now
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                className="sm:w-auto px-6"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                Maybe Later
              </Button>
            </div>

            <p className="text-center text-purple-100 text-xs">
              💡 Your current usage will be preserved after upgrading
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========== SCENARIO 2: Pro User Without Package ==========
  if (userPlan === 'Pro' && !hasPackage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
        <div 
          className="rounded-3xl border shadow-2xl max-w-2xl w-full"
          style={{ 
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }}
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between" style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }}
              >
                <PackageIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Purchase a Package</h2>
                <p className="text-sm text-white opacity-90">Get started with your first package</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-colors"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* No Package Message */}
            <div 
              className="rounded-xl p-4 border"
              style={{ 
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                borderColor: 'rgba(245, 158, 11, 0.3)'
              }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-200 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    No Active Package
                  </h3>
                  <p className="text-yellow-100 text-sm">
                    You're on the Pro plan but need to purchase a package to start generating emails.
                  </p>
                </div>
              </div>
            </div>

            {/* Package Info */}
            <div 
              className="rounded-2xl border p-6"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Available Packages</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-300" />
                    <span className="text-white">Starter</span>
                  </div>
                  <span className="text-purple-100 text-sm">100 generations • Rs.3000</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-300" />
                    <span className="text-white">Basic</span>
                  </div>
                  <span className="text-purple-100 text-sm">250 generations • Rs.6000</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-300" />
                    <span className="text-white font-semibold">Pro</span>
                  </div>
                  <span className="text-purple-100 text-sm">500 generations • Rs.10000</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAction}
                variant="primary"
                className="flex-1"
                icon={<PackageIcon className="h-5 w-5" />}
                style={{
                  backgroundColor: 'white',
                  color: 'var(--primary-color)'
                }}
              >
                View All Packages
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                className="sm:w-auto px-6"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default UpgradeModal;