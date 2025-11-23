"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Check, Loader2, ArrowLeft, Sparkles, AlertCircle, Zap, Crown } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import Button from '@/components/button';
import { useAuthContext } from '@/providers/AuthProvider';

export default function BundlesPage() {
  const router = useRouter();
  const { user, isLoadingUser } = useAuthContext();
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [currency, setCurrency] = useState('PKR');
  const [userPlan, setUserPlan] = useState(null);

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, isLoadingUser, router]);

  const fetchData = async () => {
    try {
      const [bundlesRes, walletRes, subRes] = await Promise.all([
        fetch('/api/bundles'),
        fetch('/api/wallet/balance'),
        fetch('/api/subscriptions/current')
      ]);

      const bundlesData = await bundlesRes.json();
      const walletData = await walletRes.json();
      const subData = await subRes.json();

      // Check if user is on Free plan
      if (subData.subscription?.plan_name === 'Free') {
        setUserPlan('Free');
      } else {
        setUserPlan('Pro');
      }

      if (bundlesData.success) {
        setBundles(bundlesData.bundles);
      }
      
      if (walletData.success) {
        const balance = Number(walletData.balance);
        setWalletBalance(isNaN(balance) ? 0 : balance);
        setCurrency(walletData.currency || 'PKR');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setWalletBalance(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (bundle) => {
    if (userPlan === 'Free') {
      alert('Please upgrade to Pro plan first!');
      router.push('/pricing');
      return;
    }

    // TODO: Integrate payment gateway (NayaPay/Stripe)
    alert(`Payment integration coming soon!\n\nYou selected: ${bundle.name}\nPrice: ${currency} ${bundle.price}\n\nThis will add ${currency} ${bundle.price} to your wallet for ${bundle.email_count} email operations.`);
  };

  if (loading || isLoadingUser) {
    return (
      <PageWrapper showFooter={false}>
        <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--background-secondary)' }}>
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: 'var(--primary-color)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading bundles...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Show upgrade prompt for Free users
  if (userPlan === 'Free') {
    return (
      <PageWrapper showFooter={true}>
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background-secondary)' }}>
          <div className="container mx-auto px-4 py-12">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              icon={<ArrowLeft className="h-5 w-5" />}
              className="mb-6"
            >
              Back
            </Button>

            <div className="max-w-2xl mx-auto text-center">
              <div 
                className="rounded-2xl border p-8 sm:p-12"
                style={{ 
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border-light)'
                }}
              >
                <Crown className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--primary-color)' }} />
                <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                  Upgrade to Pro Required
                </h1>
                <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Credit bundles are available for Pro plan members only. Upgrade now to unlock pay-as-you-go pricing and unlimited email operations.
                </p>
                <Button
                  onClick={() => router.push('/pricing')}
                  variant="primary"
                  icon={<Crown className="h-5 w-5" />}
                  size="lg"
                >
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper showFooter={true}>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background-secondary)' }}>
        <div className="container mx-auto px-4 py-8 sm:py-12">
          
          {/* Back Button */}
          <Button
            onClick={() => router.back()}
            variant="ghost"
            icon={<ArrowLeft className="h-5 w-5" />}
            className="mb-6"
          >
            Back
          </Button>

          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: 'var(--accent-color)' }} />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ color: 'var(--foreground)' }}>
                Buy Email Credits
              </h1>
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: 'var(--accent-color)' }} />
            </div>
            <p className="text-base sm:text-xl mb-6" style={{ color: 'var(--text-secondary)' }}>
              Add credits to your wallet for unlimited email operations
            </p>
            
            {/* Current Balance Card */}
            <div 
              className="mt-6 rounded-xl border p-4 sm:p-6 max-w-md mx-auto"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-light)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: 'var(--accent-color)' }} />
                  <span className="text-base sm:text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Current Balance:
                  </span>
                </div>
                <span className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {currency} {typeof walletBalance === 'number' ? walletBalance.toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Bundles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto mb-8 sm:mb-12">
            {bundles.map((bundle, index) => {
              const isPopular = index === 1;
              
              return (
                <div
                  key={bundle.id}
                  className="rounded-2xl border p-6 hover:shadow-xl transition-all relative"
                  style={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: isPopular ? 'var(--accent-color)' : 'var(--border-light)',
                    borderWidth: isPopular ? '2px' : '1px'
                  }}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span 
                        className="text-white text-xs font-bold px-3 py-1 rounded-full"
                        style={{ backgroundColor: 'var(--accent-color)' }}
                      >
                        POPULAR
                      </span>
                    </div>
                  )}

                  <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                    {bundle.name}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {bundle.description}
                  </p>
                  
                  <div 
                    className="rounded-lg p-4 mb-4"
                    style={{ backgroundColor: 'var(--background-secondary)' }}
                  >
                    <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                      {currency} {bundle.price}
                    </div>
                    <div className="text-sm flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                      <Zap className="h-4 w-4" style={{ color: 'var(--accent-color)' }} />
                      {bundle.email_count} email operations
                    </div>
                  </div>

                  <Button
                    onClick={() => handlePurchase(bundle)}
                    variant={isPopular ? "primary" : "outline"}
                    className="w-full"
                    icon={<Wallet className="h-5 w-5" />}
                  >
                    Purchase
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Info Section */}
          <div 
            className="rounded-xl border p-6 sm:p-8 max-w-3xl mx-auto"
            style={{ 
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border-light)'
            }}
          >
            <h4 className="text-lg sm:text-xl font-semibold mb-6 text-center flex items-center justify-center gap-2" style={{ color: 'var(--foreground)' }}>
              <AlertCircle className="h-5 w-5" style={{ color: 'var(--primary-color)' }} />
              How It Works
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                <div>
                  <p className="font-medium text-sm sm:text-base mb-1" style={{ color: 'var(--foreground)' }}>
                    Purchase Credits
                  </p>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Choose a bundle and add {currency} to your wallet instantly
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                <div>
                  <p className="font-medium text-sm sm:text-base mb-1" style={{ color: 'var(--foreground)' }}>
                    Generate Emails
                  </p>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Only {currency} 15 per email generation
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                <div>
                  <p className="font-medium text-sm sm:text-base mb-1" style={{ color: 'var(--foreground)' }}>
                    Send Emails
                  </p>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Just {currency} 15 per recipient, no limits
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                <div>
                  <p className="font-medium text-sm sm:text-base mb-1" style={{ color: 'var(--foreground)' }}>
                    Credits Never Expire
                  </p>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Use them anytime, pay only for what you use
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div 
              className="mt-6 pt-6 border-t"
              style={{ borderTopColor: 'var(--border-light)' }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--primary-color)' }} />
                <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--foreground)' }}>Pro Tip:</strong> Buy larger bundles to get more email operations for your money. All credits are added to your wallet immediately and can be used anytime.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-8 sm:mt-12">
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Need help choosing? Check our pricing details
            </p>
            <Button
              onClick={() => router.push('/pricing')}
              variant="outline"
            >
              View All Plans
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}