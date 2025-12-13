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
import PricingSection from '../factions/pricing-section';

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
      <PricingSection/>
      <StatsSection />
    </div>
  );
};

export default HomePage;