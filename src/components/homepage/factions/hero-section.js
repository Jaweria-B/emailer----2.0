import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Mail, Zap, Users, TrendingUp, ArrowRight, 
  CheckCircle, Clock, Shield, Target, Globe, Send, 
  BarChart, Star, Briefcase, GraduationCap, Megaphone, Building
} from 'lucide-react';
import Button from "@/components/button"; 
import LinkButton from '@/components/linkButton';

// Animated Typing Hero Section
const HeroSection = ({ onGetStarted }) => {
  const [emailCount, setEmailCount] = useState(60);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  const userTypes = [
    {
      type: 'Student',
      icon: GraduationCap,
      benefits: [
        'Write professional emails to professors',
        'Craft impressive scholarship applications',
        'Network with industry professionals',
        'Secure internship opportunities faster'
      ]
    },
    {
      type: 'Business Professional',
      icon: Briefcase,
      benefits: [
        'Create compelling proposals quickly',
        'Follow up with clients professionally',
        'Craft perfect cold outreach emails',
        'Save 5+ hours per week'
      ]
    },
    {
      type: 'Marketer',
      icon: Megaphone,
      benefits: [
        'Generate personalized campaigns at scale',
        'A/B test different email variations',
        'Increase open rates by 40%',
        'Automate your outreach workflow'
      ]
    },
    {
      type: 'Business Owner',
      icon: Building,
      benefits: [
        'Maintain consistent brand voice',
        'Onboard clients professionally',
        'Handle customer support efficiently',
        'Scale without hiring more writers'
      ]
    }
  ];

  const currentUser = userTypes[currentUserIndex];
  const targetText = currentUser.type;

  // Typing animation effect
  useEffect(() => {
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = isDeleting ? 500 : 2000;

    if (!isDeleting && charIndex === targetText.length) {
      setTimeout(() => setIsDeleting(true), pauseTime);
      return;
    }

    if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setCurrentUserIndex((prev) => (prev + 1) % userTypes.length);
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayedText(targetText.slice(0, isDeleting ? charIndex - 1 : charIndex + 1));
      setCharIndex(isDeleting ? charIndex - 1 : charIndex + 1);
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, targetText]);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setEmailCount(data.emailsGenerated || 60))
      .catch(() => setEmailCount(60));
  }, []);

  const IconComponent = currentUser.icon;

  return (
    <section className="relative overflow-hidden pt-32 pb-24" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 50%, #f0f9ff 100%)' }}>
      {/* Animated blobs - blue only */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" style={{ backgroundColor: '#93c5fd' }}></div>
        <div className="absolute top-40 right-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" style={{ backgroundColor: '#60a5fa' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" style={{ backgroundColor: '#3b82f6' }}></div>
      </div>

      <div className="container mx-auto px-4 relative" style={{ zIndex: 10 }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md mb-8">
              <Sparkles className="w-4 h-4" style={{ color: '#3b82f6' }} />
              <span className="text-sm font-semibold" style={{ color: '#1f2937' }}>
                {emailCount.toLocaleString()}+ Emails Generated
              </span>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#10b981' }}></div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: '#1f2937' }}>
              Craft Perfect Emails
              <span className="block" style={{ color: '#3b82f6' }}>in Seconds with AI</span>
            </h1>

            <p className="text-xl md:text-2xl mb-10 leading-relaxed max-w-3xl mx-auto" style={{ color: '#6b7280' }}>
              Transform your thoughts into professional, personalized emails instantly
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                variant="primary"
                size="lg"
                onClick={onGetStarted}
                icon={<ArrowRight className="w-5 h-5" />}
                className="group"
              >
                Start Free
              </Button>
              <LinkButton
                href="/pricing"
                variant="outline"
                size="lg"
              >
                View Pricing
              </LinkButton>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: '#6b7280' }}>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: '#3b82f6' }} />
                <span>100% secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: '#3b82f6' }} />
                <span>Setup in 30 seconds</span>
              </div>
            </div>
          </div>

          {/* Animated User Type Section */}
          <div className="mt-16 bg-white rounded-3xl shadow-2xl overflow-hidden border-2" style={{ borderColor: '#e5e7eb' }}>
            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#1f2937' }}>
                  Are you a{' '}
                  <span className="inline-flex items-center gap-2" style={{ color: '#3b82f6' }}>
                    {displayedText}
                    <span className="inline-block w-0.5 h-8 animate-pulse" style={{ backgroundColor: '#3b82f6' }}></span>
                  </span>
                  ?
                </h2>
                <p className="text-lg" style={{ color: '#6b7280' }}>See how OpenPromote can help you</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Icon Side */}
                <div className="flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full flex items-center justify-center shadow-xl" style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)' }}>
                    <IconComponent className="w-24 h-24 text-white" />
                  </div>
                </div>

                {/* Benefits Side */}
                <div>
                  <ul className="space-y-4">
                    {currentUser.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
                        <span className="text-lg" style={{ color: '#374151' }}>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={onGetStarted}
                      className="w-full md:w-auto"
                    >
                      Get Started Free
                    </Button>
                  </div>
                </div>
              </div>

              {/* User Type Indicators */}
              <div className="flex justify-center gap-2 mt-8">
                {userTypes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentUserIndex(index);
                      setCharIndex(0);
                      setDisplayedText('');
                      setIsDeleting(false);
                    }}
                    className="w-3 h-3 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: currentUserIndex === index ? '#3b82f6' : '#d1d5db',
                      transform: currentUserIndex === index ? 'scale(1.2)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;