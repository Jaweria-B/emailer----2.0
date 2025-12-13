'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Check, X, Loader2, Sparkles, Crown, 
  Package as PackageIcon, Mail, Zap, AlertCircle, 
  Package2,
  PackageOpen
} from 'lucide-react';
import Button from '@/components/button';
import LinkButton from '@/components/linkButton';
import { useAuthContext } from '@/providers/AuthProvider';

const PricingSection = () => {
  const router = useRouter();
  const { user, isLoadingUser } = useAuthContext();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [purchasingPackageId, setPurchasingPackageId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [user, isLoadingUser]);

  const fetchData = async () => {
    try {
      const [packagesRes, subRes] = await Promise.all([
        fetch('/api/packages'),
        user ? fetch('/api/subscriptions/current') : Promise.resolve({ ok: false })
      ]);

      if (packagesRes.ok) {
        const packagesData = await packagesRes.json();
        const filteredPackages = packagesData.packages.filter(
          pkg => pkg.name !== 'Business'
        );
        setPackages(filteredPackages);
      }

      if (subRes.ok && user) {
        const subData = await subRes.json();
        setSubscriptionData(subData.subscription);
        
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
    if (!user) {
      router.push('/login');
      return;
    }

    if (subscriptionData?.plan_name === 'Free') {
      setPurchasingPackageId(pkg.id);
      
      try {
        const upgradeRes = await fetch('/api/subscriptions/upgrade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan_id: 2 })
        });

        if (!upgradeRes.ok) {
          const error = await upgradeRes.json();
          alert('Failed to upgrade to Pro plan. Please try again.');
          setPurchasingPackageId(null);
          return;
        }
        
        const purchaseRes = await fetch('/api/packages/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ package_id: pkg.id })
        });

        if (purchaseRes.ok) {
          alert(`✅ Successfully purchased ${pkg.name} package!\n\nYou now have ${pkg.credits} email generations with ${pkg.sends_per_email} sends per email.`);
          await fetchData();
        } else {
          const error = await purchaseRes.json();
          alert(error.error || 'Failed to purchase package');
        }
      } catch (error) {
        alert('An error occurred. Please try again.');
      } finally {
        setPurchasingPackageId(null);
      }
      return;
    }

    if (subscriptionData?.plan_name === 'Pro') {
      setPurchasingPackageId(pkg.id);
      
      try {
        const purchaseRes = await fetch('/api/packages/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ package_id: pkg.id })
        });

        if (purchaseRes.ok) {
          alert(`✅ Successfully purchased ${pkg.name} package!\n\nYou now have ${pkg.credits} email generations with ${pkg.sends_per_email} sends per email.`);
          await fetchData();
        } else {
          const error = await purchaseRes.json();
          alert(error.error || 'Failed to purchase package');
        }
      } catch (error) {
        alert('An error occurred. Please try again.');
      } finally {
        setPurchasingPackageId(null);
      }
    }
  };

  const handleFreeAction = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (subscriptionData?.plan_name === 'Free') {
      router.push('/dashboard');
      return;
    }
  };

  const handleBusinessContact = () => {
    alert('Contact form coming soon!\n\nFor now, please email us at: business@openpromote.uinfo.org');
  };

  const isFree = subscriptionData?.plan_name === 'Free';
  const isPro = subscriptionData?.plan_name === 'Pro';

  if (loading && user) {
    return (
      <section style={{ backgroundColor: 'var(--background-secondary)', padding: '4rem 1rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <Loader2 className="w-12 h-12 mx-auto animate-spin" style={{ color: 'var(--primary-color)' }} />
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading packages...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" style={{ backgroundColor: 'var(--background-secondary)', padding: '5rem 1rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '3.0rem', fontWeight: 'bold', color: 'var(--foreground)', margin: 0 }}>
              Pricings for You
            </h2>
          </div>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Choose Your Plan
          </p>
        </div>

        {/* ROW 1: Current Plan Status (Only for authenticated users with packages) */}
        {user && isPro && currentPackage && (
          <div style={{ marginBottom: '3rem', maxWidth: '900px', margin: '0 auto 3rem auto' }}>
            <div 
              style={{ 
                padding: '1.5rem',
                borderRadius: '1rem',
                border: '2px solid var(--success)',
                backgroundColor: 'var(--background)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'var(--success-light)' }}>
                    <PackageIcon style={{ width: '1.5rem', height: '1.5rem', color: 'var(--success)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--foreground)', margin: 0 }}>
                      Your Current Package
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Active since {new Date(currentPackage.purchased_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'var(--background-secondary)' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                    Package
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
                    {currentPackage.package_name}
                  </div>
                </div>

                <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'var(--background-secondary)' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                    Generations Left
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {currentPackage.generations_remaining}
                  </div>
                </div>

                <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'var(--background-secondary)' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                    Sends Per Email
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {currentPackage.sends_per_email}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ROW 2: Free Plan Card */}
        <div style={{ maxWidth: '400px', margin: '0 auto 3rem auto' }}>
          <div
            style={{
              position: 'relative',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: isFree ? '2px solid var(--success)' : '1px solid var(--border-light)',
              backgroundColor: 'var(--background)',
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isFree && (
              <div style={{ position: 'absolute', top: '-12px', right: '1rem' }}>
                <span 
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    backgroundColor: 'var(--success)',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px'
                  }}
                >
                  <Check style={{ width: '0.75rem', height: '0.75rem' }} />
                  ACTIVE
                </span>
              </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <PackageOpen style={{ width: '2rem', height: '2rem', color: 'var(--primary-color)' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--foreground)' }}>
                Free Plan
              </h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--primary-color)' }}>
                Rs.0
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                per month
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Check style={{ width: '1rem', height: '1rem', color: 'var(--success)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)', display: 'block' }}>
                    5 Email Generations
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    per month
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Check style={{ width: '1rem', height: '1rem', color: 'var(--success)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)', display: 'block' }}>
                    100 Recipients per Email
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    send to up to 100 people
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Check style={{ width: '1rem', height: '1rem', color: 'var(--success)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)', display: 'block' }}>
                    100 Sends per Day
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    daily sending limit
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Check style={{ width: '1rem', height: '1rem', color: 'var(--success)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--foreground)' }}>
                  AI-Powered Email Generation
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check style={{ width: '1rem', height: '1rem', color: 'var(--success)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--foreground)' }}>
                  Includes Branding
                </span>
              </div>
            </div>

            <Button
              onClick={handleFreeAction}
              variant={isFree ? "outline" : "primary"}
              style={{ width: '100%' }}
              disabled={isFree}
              icon={<Sparkles style={{ width: '1rem', height: '1rem' }} />}
            >
              {!user ? 'Get Started Free' : isFree ? 'Current Plan' : 'View Free Features'}
            </Button>

            {!isFree && (
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                Want more? Check out our Pro packages below
              </p>
            )}
          </div>
        </div>

        {/* ROW 3: Pro Package Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto 3rem auto' }}>
          {packages.map((pkg) => {
            const isPopular = pkg.name === 'Pro' || pkg.name === 'Premium';
            const isCurrentPackage = currentPackage?.package_name === pkg.name;
            
            return (
              <div
                key={pkg.id}
                style={{
                  position: 'relative',
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  border: isPopular ? '2px solid var(--primary-color)' : '1px solid var(--border-light)',
                  backgroundColor: 'var(--background)',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {isPopular && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)' }}>
                    <span 
                      style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px'
                      }}
                    >
                      <Sparkles style={{ width: '0.875rem', height: '0.875rem' }} />
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {isCurrentPackage && (
                  <div style={{ position: 'absolute', top: '-12px', right: '1rem' }}>
                    <span 
                      style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        backgroundColor: 'var(--success)',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px'
                      }}
                    >
                      <Check style={{ width: '0.75rem', height: '0.75rem' }} />
                      ACTIVE
                    </span>
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--foreground)' }}>
                    {pkg.name}
                  </h3>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--primary-color)' }}>
                    Rs.{pkg.price}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    one-time purchase
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Zap style={{ width: '1rem', height: '1rem', color: 'var(--primary-color)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--foreground)' }}>
                      <strong>{pkg.credits}</strong> email generations
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Mail style={{ width: '1rem', height: '1rem', color: 'var(--primary-color)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--foreground)' }}>
                      <strong>{pkg.sends_per_email}</strong> sends per email
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Check style={{ width: '1rem', height: '1rem', color: 'var(--success)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--foreground)' }}>
                      No branding
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check style={{ width: '1rem', height: '1rem', color: 'var(--success)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--foreground)' }}>
                      200 sends/day limit
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handlePurchase(pkg)}
                  variant={isPopular ? "primary" : "outline"}
                  style={{ width: '100%' }}
                  disabled={isCurrentPackage || purchasingPackageId === pkg.id}
                  icon={purchasingPackageId === pkg.id ? <Loader2 style={{ width: '1rem', height: '1rem' }} className="animate-spin" /> : <PackageIcon style={{ width: '1rem', height: '1rem' }} />}
                >
                  {purchasingPackageId === pkg.id ? 'Processing...' : isCurrentPackage ? 'Current Package' : 'Purchase Now'}
                </Button>
              </div>
            );
          })}
        </div>

        {/* ROW 4: Business Card */}
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div
            style={{
              padding: '1.5rem',
              borderRadius: '1rem',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--background)',
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <Crown style={{ width: '2rem', height: '2rem', color: 'var(--warning)' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--foreground)' }}>
                Business
              </h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--primary-color)' }}>
                Custom
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                tailored for you
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Check style={{ width: '1rem', height: '1rem', color: 'var(--success)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--foreground)' }}>
                  Custom volume
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Check style={{ width: '1rem', height: '1rem', color: 'var(--success)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--foreground)' }}>
                  Priority support
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Check style={{ width: '1rem', height: '1rem', color: 'var(--success)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--foreground)' }}>
                  Dedicated account manager
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check style={{ width: '1rem', height: '1rem', color: 'var(--success)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--foreground)' }}>
                  Custom integrations
                </span>
              </div>
            </div>

            <Button
              onClick={handleBusinessContact}
              variant="outline"
              style={{ width: '100%' }}
              icon={<Mail style={{ width: '1rem', height: '1rem' }} />}
            >
              Contact Us
            </Button>
          </div>
        </div>

        {/* Info Section */}
        <div 
          style={{ 
            marginTop: '3rem',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-light)',
            backgroundColor: 'var(--background)',
            maxWidth: '900px',
            margin: '3rem auto 0'
          }}
        >
          <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--foreground)' }}>
            <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary-color)' }} />
            How Packages Work
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <Check style={{ width: '1.25rem', height: '1.25rem', color: 'var(--success)', flexShrink: 0, marginTop: '0.125rem' }} />
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.25rem', color: 'var(--foreground)' }}>
                  One-Time Purchase
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Buy a package and use generations at your own pace - no monthly subscription, no expiry
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <Check style={{ width: '1.25rem', height: '1.25rem', color: 'var(--success)', flexShrink: 0, marginTop: '0.125rem' }} />
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.25rem', color: 'var(--foreground)' }}>
                  Instant Pro Access
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Purchasing any package instantly upgrades you to Pro with full features
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <Check style={{ width: '1.25rem', height: '1.25rem', color: 'var(--success)', flexShrink: 0, marginTop: '0.125rem' }} />
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.25rem', color: 'var(--foreground)' }}>
                  Bulk Sending
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Send each email to hundreds of recipients based on your package
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <Check style={{ width: '1.25rem', height: '1.25rem', color: 'var(--success)', flexShrink: 0, marginTop: '0.125rem' }} />
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.25rem', color: 'var(--foreground)' }}>
                  Daily Limit
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Pro users can send up to 200 emails per day
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;