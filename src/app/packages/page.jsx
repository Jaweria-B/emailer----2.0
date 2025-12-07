"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Check, Loader2, ArrowLeft, Sparkles, AlertCircle, Zap, Crown, Package as PackageIcon, Mail } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import Button from '@/components/button';
import LinkButton from '@/components/linkButton';
import { useAuthContext } from '@/providers/AuthProvider';

export default function PackagesPage() {
  const router = useRouter();
  const { user, isLoadingUser } = useAuthContext();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [purchasingPackageId, setPurchasingPackageId] = useState(null);

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
      const [packagesRes, subRes] = await Promise.all([
        fetch('/api/packages'),
        fetch('/api/subscriptions/current')
      ]);

      if (packagesRes.ok) {
        const packagesData = await packagesRes.json();
        // Only get Starter, Basic, Pro (exclude Business from backend)
        const filteredPackages = packagesData.packages.filter(
          pkg => pkg.name !== 'Business'
        );
        setPackages(filteredPackages);
      }

      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscriptionData(subData.subscription);
        
        // Get current package info if Pro user has one
        if (subData.subscription?.plan_name === 'Pro' && subData.package) {
          setCurrentPackage(subData.package);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg) => {
    console.log('🛒 Starting purchase for:', pkg.name);
    
    // If user is on Free plan, they need to upgrade first
    if (subscriptionData?.plan_name === 'Free') {
      console.log('📋 User on Free plan, upgrading to Pro first...');
      setPurchasingPackageId(pkg.id);
      
      try {
        // First, upgrade user to Pro plan
        const upgradeRes = await fetch('/api/subscriptions/upgrade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan_id: 2 }) // Pro plan ID
        });

        if (!upgradeRes.ok) {
          const error = await upgradeRes.json();
          console.error('❌ Upgrade failed:', error);
          alert('Failed to upgrade to Pro plan. Please try again.');
          setPurchasingPackageId(null);
          return;
        }

        console.log('✅ Upgraded to Pro plan');
        
        // Now purchase the package
        const purchaseRes = await fetch('/api/packages/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ package_id: pkg.id })
        });

        if (purchaseRes.ok) {
          console.log('✅ Package purchased successfully!');
          alert(`✅ Successfully purchased ${pkg.name} package!\n\nYou now have ${pkg.credits} email generations with ${pkg.sends_per_email} sends per email.`);
          await fetchData(); // Refresh data
        } else {
          const error = await purchaseRes.json();
          console.error('❌ Purchase failed:', error);
          alert(error.error || 'Failed to purchase package');
        }
      } catch (error) {
        console.error('❌ Error:', error);
        alert('An error occurred. Please try again.');
      } finally {
        setPurchasingPackageId(null);
      }
      return;
    }

    // If already Pro, just purchase the package
    if (subscriptionData?.plan_name === 'Pro') {
      console.log('🎯 User on Pro, purchasing package directly...');
      setPurchasingPackageId(pkg.id);
      
      try {
        const purchaseRes = await fetch('/api/packages/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ package_id: pkg.id })
        });

        if (purchaseRes.ok) {
          console.log('✅ Package purchased successfully!');
          alert(`✅ Successfully purchased ${pkg.name} package!\n\nYou now have ${pkg.credits} email generations with ${pkg.sends_per_email} sends per email.`);
          await fetchData(); // Refresh data
        } else {
          const error = await purchaseRes.json();
          console.error('❌ Purchase failed:', error);
          alert(error.error || 'Failed to purchase package');
        }
      } catch (error) {
        console.error('❌ Error:', error);
        alert('An error occurred. Please try again.');
      } finally {
        setPurchasingPackageId(null);
      }
    }
  };

  const handleBusinessContact = () => {
    alert('Contact form coming soon!\n\nFor now, please email us at: business@openpromote.uinfo.org');
  };

  if (loading || isLoadingUser) {
    return (
      <PageWrapper showFooter={false}>
        <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--background-secondary)' }}>
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: 'var(--primary-color)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading packages...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const isFree = subscriptionData?.plan_name === 'Free';
  const isPro = subscriptionData?.plan_name === 'Pro';

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
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: 'var(--primary-color)' }} />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ color: 'var(--foreground)' }}>
                Email Generation Packages
              </h1>
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: 'var(--primary-color)' }} />
            </div>
            <p className="text-base sm:text-xl mb-6" style={{ color: 'var(--text-secondary)' }}>
              {isFree 
                ? 'Choose a package to upgrade to Pro and unlock powerful email generation'
                : 'Upgrade your package or purchase a new one'
              }
            </p>
          </div>

          {/* Free User Info Banner */}
          {isFree && (
            <div className="mb-8 max-w-3xl mx-auto">
              <div 
                className="rounded-xl border p-4 sm:p-6"
                style={{ 
                  backgroundColor: 'var(--primary-lightest)',
                  borderColor: 'var(--primary-lighter)'
                }}
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="h-6 w-6 flex-shrink-0" style={{ color: 'var(--primary-color)' }} />
                  <div className="flex-1">
                    <h3 className="font-bold mb-2" style={{ color: 'var(--primary-active)' }}>
                      📦 Ready to Go Pro?
                    </h3>
                    <p className="text-sm mb-2" style={{ color: 'var(--primary-active)' }}>
                      Purchase any package below to instantly upgrade to Pro plan. Get unlimited email generations (based on your package), send to more recipients, and remove branding!
                    </p>
                    <p className="text-xs" style={{ color: 'var(--primary-active)' }}>
                      <strong>Note:</strong> There's no monthly subscription fee. Just purchase the package you need and start using it right away.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Current Package Card (Pro Users Only) */}
          {isPro && currentPackage && (
            <div className="mb-8 max-w-3xl mx-auto">
              <div 
                className="rounded-xl border p-6 shadow-lg"
                style={{ 
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--success)'
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: 'var(--success-light)' }}
                    >
                      <PackageIcon className="h-6 w-6" style={{ color: 'var(--success)' }} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                        Your Current Package
                      </h2>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Active since {new Date(currentPackage.purchased_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div 
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: 'var(--background-secondary)' }}
                  >
                    <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Package
                    </div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--success)' }}>
                      {currentPackage.package_name}
                    </div>
                  </div>

                  <div 
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: 'var(--background-secondary)' }}
                  >
                    <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Generations Left
                    </div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>
                      {currentPackage.generations_remaining}
                    </div>
                  </div>

                  <div 
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: 'var(--background-secondary)' }}
                  >
                    <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Sends Per Email
                    </div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>
                      {currentPackage.sends_per_email}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Active Package Warning (Pro Users Only) */}
          {isPro && !currentPackage && (
            <div className="mb-8 max-w-3xl mx-auto">
              <div 
                className="rounded-xl border p-6"
                style={{ 
                  backgroundColor: 'var(--warning-light)',
                  borderColor: 'var(--warning)'
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 flex-shrink-0" style={{ color: 'var(--warning)' }} />
                  <div>
                    <h3 className="font-bold mb-2" style={{ color: 'var(--warning)' }}>
                      No Active Package
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--warning)' }}>
                      Purchase a package below to start generating emails with Pro benefits.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Packages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto mb-8">
            {packages.map((pkg, index) => {
              const isPopular = pkg.name === 'Pro' || pkg.name === 'Premium';
              const isStarter = pkg.name === 'Starter';
              const isCurrentPackage = currentPackage?.package_name === pkg.name;
              
              return (
                <div
                  key={pkg.id}
                  className="rounded-2xl border p-6 hover:shadow-xl transition-all relative"
                  style={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: isPopular ? 'var(--primary-color)' : 'var(--border-light)',
                    borderWidth: isPopular ? '2px' : '1px'
                  }}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span 
                        className="text-white text-xs font-bold px-3 py-1 rounded-full"
                        style={{ backgroundColor: 'var(--primary-color)' }}
                      >
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {isCurrentPackage && (
                    <div className="absolute -top-3 right-4">
                      <span 
                        className="text-white text-xs font-bold px-3 py-1 rounded-full"
                        style={{ backgroundColor: 'var(--success)' }}
                      >
                        <Check className="h-3 w-3 inline mr-1" />
                        ACTIVE
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                      {pkg.name}
                    </h3>
                    <div 
                      className="text-3xl sm:text-4xl font-bold mb-1"
                      style={{ color: 'var(--primary-color)' }}
                    >
                      Rs.{pkg.price}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      one-time purchase
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--primary-color)' }} />
                      <span style={{ color: 'var(--foreground)' }}>
                        <strong>{pkg.credits}</strong> email generations
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--primary-color)' }} />
                      <span style={{ color: 'var(--foreground)' }}>
                        <strong>{pkg.sends_per_email}</strong> sends per email
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--success)' }} />
                      <span style={{ color: 'var(--foreground)' }}>
                        No branding
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--success)' }} />
                      <span style={{ color: 'var(--foreground)' }}>
                        200 sends/day limit
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handlePurchase(pkg)}
                    variant={isPopular ? "primary" : "outline"}
                    className="w-full"
                    disabled={isCurrentPackage || purchasingPackageId === pkg.id}
                    icon={purchasingPackageId === pkg.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageIcon className="h-4 w-4" />}
                  >
                    {purchasingPackageId === pkg.id ? 'Processing...' : isCurrentPackage ? 'Current Package' : 'Purchase Now'}
                  </Button>
                </div>
              );
            })}

            {/* Business Package Card */}
            <div
              className="rounded-2xl border p-6 hover:shadow-xl transition-all"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-light)'
              }}
            >
              <div className="text-center mb-4">
                <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                  Business
                </h3>
                <div 
                  className="text-3xl sm:text-4xl font-bold mb-1"
                  style={{ color: 'var(--primary-color)' }}
                >
                  Custom
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  tailored for you
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--success)' }} />
                  <span style={{ color: 'var(--foreground)' }}>
                    Custom volume
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--success)' }} />
                  <span style={{ color: 'var(--foreground)' }}>
                    Priority support
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--success)' }} />
                  <span style={{ color: 'var(--foreground)' }}>
                    Dedicated account manager
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--success)' }} />
                  <span style={{ color: 'var(--foreground)' }}>
                    Custom integrations
                  </span>
                </div>
              </div>

              <Button
                onClick={handleBusinessContact}
                variant="outline"
                className="w-full"
                icon={<Mail className="h-4 w-4" />}
              >
                Contact Us
              </Button>
            </div>
          </div>

          {/* Info Section */}
          <div 
            className="rounded-xl border p-6 sm:p-8 max-w-5xl mx-auto"
            style={{ 
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border-light)'
            }}
          >
            <h4 className="text-lg sm:text-xl font-semibold mb-6 text-center flex items-center justify-center gap-2" style={{ color: 'var(--foreground)' }}>
              <AlertCircle className="h-5 w-5" style={{ color: 'var(--primary-color)' }} />
              How Packages Work
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                <div>
                  <p className="font-medium text-sm sm:text-base mb-1" style={{ color: 'var(--foreground)' }}>
                    One-Time Purchase
                  </p>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Buy a package and use generations at your own pace - no monthly subscription, no expiry
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                <div>
                  <p className="font-medium text-sm sm:text-base mb-1" style={{ color: 'var(--foreground)' }}>
                    Instant Pro Access
                  </p>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Purchasing any package instantly upgrades you to Pro with full features
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                <div>
                  <p className="font-medium text-sm sm:text-base mb-1" style={{ color: 'var(--foreground)' }}>
                    Bulk Sending
                  </p>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Send each email to hundreds of recipients based on your package
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                <div>
                  <p className="font-medium text-sm sm:text-base mb-1" style={{ color: 'var(--foreground)' }}>
                    Daily Limit
                  </p>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Pro users can send up to 200 emails per day
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-8 sm:mt-12">
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Questions about packages?
            </p>
            <LinkButton
              href="/pricing"
              variant="outline"
            >
              View Pricing & Plans
            </LinkButton>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}