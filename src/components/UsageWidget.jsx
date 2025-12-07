"use client"
import React from 'react';
import { TrendingUp, Crown, AlertCircle, Package as PackageIcon, Mail, Zap, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from './button';

const UsageWidget = ({ usage, subscription, onUpgradeClick }) => {
  const router = useRouter();

  if (!usage || !subscription) return null;

  const isFree = subscription.plan_name === 'Free';
  const isPro = subscription.plan_name === 'Pro';

  // ========== FREE PLAN UI ==========
  if (isFree) {
    const generationPercentage = usage.generations_limit > 0 
      ? (usage.generations_used / usage.generations_limit) * 100 
      : 0;

    const generationsRemaining = Math.max(0, usage.generations_limit - usage.generations_used);
    const isLowOnGenerations = generationsRemaining <= 1;

    return (
      <div 
        className="rounded-2xl border p-6 shadow-xl"
        style={{ 
          backgroundColor: 'var(--background)',
          borderColor: 'var(--border-light)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" style={{ color: 'var(--primary-color)' }} />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
              Your Usage
            </h3>
          </div>
          <span 
            className="text-xs font-bold px-2 py-1 rounded-full"
            style={{ 
              backgroundColor: 'var(--background-secondary)',
              color: 'var(--text-secondary)'
            }}
          >
            FREE
          </span>
        </div>

        {/* Generations Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Email Generations
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              {usage.generations_used} / {usage.generations_limit}
            </span>
          </div>
          <div 
            className="w-full rounded-full h-2.5 overflow-hidden"
            style={{ backgroundColor: 'var(--background-secondary)' }}
          >
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(generationPercentage, 100)}%`,
                backgroundColor: generationPercentage >= 80 
                  ? 'var(--error)' 
                  : generationPercentage >= 60
                  ? 'var(--warning)'
                  : 'var(--success)'
              }}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {generationsRemaining} generations remaining
          </p>
        </div>

        {/* Sends Info */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm mb-2">
            <Mail className="h-4 w-4" style={{ color: 'var(--primary-color)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>
              Send each email to <strong style={{ color: 'var(--foreground)' }}>{usage.sends_per_generation}</strong> recipients
            </span>
          </div>
        </div>

        {/* Low Warning */}
        {isLowOnGenerations && (
          <div 
            className="mb-4 rounded-lg p-3 border"
            style={{ 
              backgroundColor: 'var(--warning-light)',
              borderColor: 'var(--warning)'
            }}
          >
            <p className="text-xs flex items-center gap-2" style={{ color: 'var(--warning)' }}>
              <AlertCircle className="h-4 w-4" />
              Running low! Upgrade to Pro for unlimited generation.
            </p>
          </div>
        )}

        {/* Upgrade Button */}
        <Button
          onClick={onUpgradeClick}
          variant="primary"
          className="w-full"
          icon={<Crown className="h-4 w-4" />}
        >
          Upgrade to Pro
        </Button>

        {/* Period Info */}
        <div 
          className="mt-4 pt-4 text-center"
          style={{ 
            borderTopWidth: '1px',
            borderTopStyle: 'solid',
            borderTopColor: 'var(--border-light)'
          }}
        >
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Resets on {new Date(usage.period_end).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  // ========== PRO PLAN UI ==========
  if (isPro) {
    const hasPackage = usage.package_generations_remaining > 0;
    const packagePercentage = hasPackage && usage.package_total_generations > 0
      ? (usage.package_generations_remaining / usage.package_total_generations) * 100
      : 0;

    const dailySendsPercentage = usage.daily_sends_limit > 0
      ? (usage.daily_sends_used / usage.daily_sends_limit) * 100
      : 0;

    const isLowOnPackage = hasPackage && usage.package_generations_remaining <= 10;
    const isLowOnDailySends = usage.daily_sends_limit > 0 && (usage.daily_sends_limit - usage.daily_sends_used) <= 20;

    return (
      <div 
        className="rounded-2xl border-2 p-6 shadow-xl"
        style={{ 
          backgroundColor: 'var(--background)',
          borderColor: 'var(--primary-color)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5" style={{ color: 'var(--primary-color)' }} />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
              Pro Plan
            </h3>
          </div>
          <span 
            className="text-xs font-bold px-2 py-1 rounded-full"
            style={{ 
              backgroundColor: 'var(--primary-lightest)',
              color: 'var(--primary-color)'
            }}
          >
            PRO
          </span>
        </div>

        {/* Package Progress */}
        {hasPackage ? (
          <div 
            className="rounded-xl border p-4 mb-4"
            style={{ 
              backgroundColor: 'var(--primary-lightest)',
              borderColor: 'var(--primary-lighter)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <PackageIcon className="h-5 w-5" style={{ color: 'var(--primary-color)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--primary-active)' }}>
                {usage.package_name || 'Current Package'}
              </span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--primary-active)' }}>
                Generations Remaining
              </span>
              <span className="text-sm font-semibold" style={{ color: 'var(--primary-color)' }}>
                {usage.package_generations_remaining} / {usage.package_total_generations || 0}
              </span>
            </div>
            
            <div 
              className="w-full rounded-full h-2.5 overflow-hidden"
              style={{ backgroundColor: 'var(--background-secondary)' }}
            >
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(packagePercentage, 100)}%`,
                  backgroundColor: packagePercentage <= 20 
                    ? 'var(--error)' 
                    : packagePercentage <= 50
                    ? 'var(--warning)'
                    : 'var(--success)'
                }}
              />
            </div>

            <div className="flex items-center gap-2 text-xs mt-2" style={{ color: 'var(--primary-active)' }}>
              <Mail className="h-3 w-3" />
              <span>{usage.package_sends_per_email || 0} sends per email</span>
            </div>
          </div>
        ) : (
          <div 
            className="rounded-xl border p-4 mb-4"
            style={{ 
              backgroundColor: 'var(--error-light)',
              borderColor: 'var(--error)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5" style={{ color: 'var(--error)' }} />
              <span className="font-semibold text-sm" style={{ color: 'var(--error)' }}>
                No Active Package
              </span>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--error)' }}>
              Purchase a package to start generating emails
            </p>
            <Button
              onClick={() => router.push('/packages')}
              variant="primary"
              size="sm"
              className="w-full"
              icon={<PackageIcon className="h-4 w-4" />}
            >
              Purchase Package
            </Button>
          </div>
        )}

        {/* Daily Sends Limit */}
        <div 
          className="rounded-xl border p-4 mb-4"
          style={{ 
            backgroundColor: 'var(--background-secondary)',
            borderColor: 'var(--border-light)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5" style={{ color: 'var(--primary-color)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Daily Sends
            </span>
            <span className="text-xs ml-auto" style={{ color: 'var(--text-secondary)' }}>
              resets in {24 - new Date().getHours()}h
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Today's Usage
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              {usage.daily_sends_used || 0} / {usage.daily_sends_limit || 200}
            </span>
          </div>
          
          <div 
            className="w-full rounded-full h-2.5 overflow-hidden"
            style={{ backgroundColor: 'var(--gray-200)' }}
          >
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(dailySendsPercentage, 100)}%`,
                backgroundColor: dailySendsPercentage >= 90 
                  ? 'var(--error)' 
                  : dailySendsPercentage >= 70
                  ? 'var(--warning)'
                  : 'var(--primary-color)'
              }}
            />
          </div>
          
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {Math.max(0, (usage.daily_sends_limit || 200) - (usage.daily_sends_used || 0))} sends remaining today
          </p>
        </div>

        {/* Warnings */}
        {isLowOnPackage && (
          <div 
            className="mb-3 rounded-lg p-3 border"
            style={{ 
              backgroundColor: 'var(--warning-light)',
              borderColor: 'var(--warning)'
            }}
          >
            <p className="text-xs flex items-center gap-2" style={{ color: 'var(--warning)' }}>
              <AlertCircle className="h-4 w-4" />
              Low on generations! Consider purchasing another package.
            </p>
          </div>
        )}

        {isLowOnDailySends && (
          <div 
            className="mb-3 rounded-lg p-3 border"
            style={{ 
              backgroundColor: 'var(--warning-light)',
              borderColor: 'var(--warning)'
            }}
          >
            <p className="text-xs flex items-center gap-2" style={{ color: 'var(--warning)' }}>
              <Clock className="h-4 w-4" />
              Approaching daily send limit! Resets in {24 - new Date().getHours()} hours.
            </p>
          </div>
        )}

        {/* Buy Package Button */}
        <Button
          onClick={() => router.push('/packages')}
          variant={hasPackage ? "outline" : "primary"}
          className="w-full"
          icon={<PackageIcon className="h-4 w-4" />}
        >
          {hasPackage ? 'Purchase More' : 'Purchase Package'}
        </Button>

        {/* Period Info */}
        <div 
          className="mt-4 pt-4 text-center"
          style={{ 
            borderTopWidth: '1px',
            borderTopStyle: 'solid',
            borderTopColor: 'var(--border-light)'
          }}
        >
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Pro subscription renews on {new Date(usage.period_end).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default UsageWidget;