import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Mail, Zap, Users, TrendingUp, ArrowRight, 
  CheckCircle, Clock, Shield, Briefcase, GraduationCap,
  Megaphone, Globe, Send, BarChart, Target, Star
} from 'lucide-react';
import HeroSection from '../factions/hero-section';
import BenefitsSection from '../factions/benefits-section';
import FeaturesSection from '../factions/features-section';
import StatsSection from '../factions/stats-section';
import HowItWorksSection from '../factions/howitworks-section';
import CTASection from '../factions/cta-section';

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
    </div>
  );
};

export default HomePage;