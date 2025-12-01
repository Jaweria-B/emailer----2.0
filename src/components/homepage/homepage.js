import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Mail, Zap, Users, TrendingUp, ArrowRight, 
  CheckCircle, Clock, Shield, Briefcase, GraduationCap,
  Megaphone, Globe, Send, BarChart, Target, Star
} from 'lucide-react';

// Hero Section Component
const HeroSection = ({ onGetStarted }) => {
  const [emailCount, setEmailCount] = useState(60);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setEmailCount(data.emailsGenerated || 60))
      .catch(() => setEmailCount(60));
  }, []);

  return (
    <section className="relative overflow-hidden pt-32 pb-24" style={{ background: 'var(--gradient-hero)' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md mb-8">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">
              {emailCount.toLocaleString()}+ Emails Generated
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Craft Perfect Emails
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              in Seconds with AI
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
            Transform your thoughts into professional, personalized emails instantly. 
            No more writer's block, no more wasted time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={onGetStarted}
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Start Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => window.location.href = '/pricing'}
              className="px-8 py-4 bg-white text-gray-800 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg border-2 border-gray-200 hover:border-purple-300 transition-all duration-300"
            >
              View Pricing
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>100% secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span>Setup in 30 seconds</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

// Features Section Component
const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate professional emails in seconds, not hours",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Target,
      title: "Perfectly Targeted",
      description: "AI adapts tone and style to your audience automatically",
      color: "from-blue-400 to-purple-500"
    },
    {
      icon: Globe,
      title: "Multi-Language",
      description: "Create emails in multiple languages effortlessly",
      color: "from-green-400 to-teal-500"
    },
    {
      icon: Send,
      title: "Bulk Sending",
      description: "Personalize and send to hundreds with one click",
      color: "from-pink-400 to-red-500"
    },
    {
      icon: BarChart,
      title: "Track Results",
      description: "Monitor your email performance and engagement",
      color: "from-indigo-400 to-blue-500"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and never shared",
      color: "from-purple-400 to-pink-500"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Succeed</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make your email workflow seamless
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Benefits by Audience Section
const BenefitsSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const audiences = [
    {
      icon: Briefcase,
      label: "Professionals",
      title: "Elevate Your Professional Communication",
      benefits: [
        "Write compelling proposals in minutes",
        "Follow up with clients professionally",
        "Craft perfect cold outreach emails",
        "Save 5+ hours per week on email writing"
      ],
      gradient: "from-blue-600 to-purple-600"
    },
    {
      icon: GraduationCap,
      label: "Students",
      title: "Ace Your Academic Communication",
      benefits: [
        "Write professional emails to professors",
        "Create impressive scholarship applications",
        "Network with alumni and professionals",
        "Get internship opportunities faster"
      ],
      gradient: "from-green-600 to-teal-600"
    },
    {
      icon: Megaphone,
      label: "Marketers",
      title: "Scale Your Email Campaigns",
      benefits: [
        "Generate hundreds of personalized emails",
        "A/B test different email variations",
        "Increase open rates by 40%",
        "Automate your outreach workflow"
      ],
      gradient: "from-pink-600 to-red-600"
    },
    {
      icon: Users,
      label: "Businesses",
      title: "Streamline Team Communication",
      benefits: [
        "Maintain consistent brand voice",
        "Onboard clients professionally",
        "Handle customer support efficiently",
        "Scale without hiring more writers"
      ],
      gradient: "from-purple-600 to-indigo-600"
    }
  ];

  const active = audiences[activeTab];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Built for Everyone
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Whether you're a student, professional, or business owner - we've got you covered
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {audiences.map((audience, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === index
                  ? `bg-gradient-to-r ${audience.gradient} text-white shadow-lg scale-105`
                  : 'bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              <audience.icon className="w-5 h-5" />
              {audience.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className={`p-12 bg-gradient-to-br ${active.gradient} text-white`}>
              <active.icon className="w-16 h-16 mb-6 opacity-90" />
              <h3 className="text-3xl font-bold mb-6">
                {active.title}
              </h3>
              <ul className="space-y-4">
                {active.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-12 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Mail className="w-16 h-16 text-purple-600" />
                </div>
                <p className="text-gray-600 text-lg mb-6">
                  Join thousands of {active.label.toLowerCase()} already using OpenPromote
                </p>
                <button
                  onClick={() => window.location.href = '/emailcurator/generate-email'}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Describe Your Email",
      description: "Tell us what you want to say in plain language. No formatting needed.",
      icon: Mail
    },
    {
      number: "02",
      title: "AI Does the Magic",
      description: "Our AI crafts a perfectly worded email matching your tone and purpose.",
      icon: Sparkles
    },
    {
      number: "03",
      title: "Review & Send",
      description: "Make any tweaks if needed, then send directly or copy to your email client.",
      icon: Send
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From idea to perfect email in three simple steps
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 -z-10"></div>

            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl font-bold mb-6 mx-auto shadow-lg">
                    {step.number}
                  </div>
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                      <step.icon className="w-10 h-10 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Stats Section
const StatsSection = () => {
  const [stats, setStats] = useState({
    emails: 60,
    users: 500,
    timeSaved: 2500,
    satisfaction: 98
  });

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(prev => ({
          ...prev,
          emails: data.emailsGenerated || prev.emails
        }));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trusted by Thousands Worldwide
          </h2>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Join the community transforming their email communication
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold mb-2">
              {stats.emails.toLocaleString()}+
            </div>
            <div className="text-lg text-purple-100">Emails Generated</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold mb-2">
              {stats.users.toLocaleString()}+
            </div>
            <div className="text-lg text-purple-100">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold mb-2">
              {stats.timeSaved.toLocaleString()}+
            </div>
            <div className="text-lg text-purple-100">Hours Saved</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold mb-2">
              {stats.satisfaction}%
            </div>
            <div className="text-lg text-purple-100">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Pricing Preview Section
const PricingPreviewSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free, upgrade as you grow. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-5xl font-bold text-gray-900 mb-2">
                Rs.0
                <span className="text-xl text-gray-500">/month</span>
              </div>
              <p className="text-gray-600">Perfect to get started</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>50 email generations/month</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>All AI providers</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Email history</span>
              </li>
            </ul>
            <button
              onClick={() => window.location.href = '/register'}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl transform md:scale-105 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
              MOST POPULAR
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-5xl font-bold mb-2">
                Rs.15
                <span className="text-xl opacity-90">/generation</span>
              </div>
              <p className="opacity-90">Pay as you go</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>Unlimited generations</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>Bulk email sending</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>No branding</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>Priority support</span>
              </li>
            </ul>
            <button
              onClick={() => window.location.href = '/pricing'}
              className="w-full px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300"
            >
              View Full Pricing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Final CTA Section
const FinalCTASection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Ready to Transform Your Emails?
        </h2>
        <p className="text-xl md:text-2xl mb-10 text-purple-100 max-w-3xl mx-auto">
          Join thousands already saving time and crafting better emails with AI
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.href = '/emailcurator/generate-email'}
            className="px-10 py-5 bg-white text-purple-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            Start Free Now
          </button>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-purple-600 transition-all duration-300"
          >
            View Pricing
          </button>
        </div>
        <p className="mt-8 text-purple-100">
          No credit card required • Free forever plan available
        </p>
      </div>
    </section>
  );
};

// Main Home Component
const HomePage = () => {
  const handleGetStarted = () => {
    window.location.href = '/emailcurator/generate-email';
  };

  return (
    <div className="min-h-screen">
      <HeroSection onGetStarted={handleGetStarted} />
      <FeaturesSection />
      <BenefitsSection />
      <HowItWorksSection />
      <StatsSection />
      <PricingPreviewSection />
      <FinalCTASection />
    </div>
  );
};

export default HomePage;