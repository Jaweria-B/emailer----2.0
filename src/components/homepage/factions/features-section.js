import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Mail, Zap, Users, TrendingUp, ArrowRight, 
  CheckCircle, Clock, Shield, Target, Globe, Send, 
  BarChart, Star, Briefcase, GraduationCap, Megaphone, Building
} from 'lucide-react';
import Button from "@/components/button"; 
import LinkButton from '@/components/linkButton';

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate professional emails in seconds, not hours"
    },
    {
      icon: Target,
      title: "Perfectly Targeted",
      description: "AI adapts tone and style to your audience automatically"
    },
    {
      icon: Globe,
      title: "Multi-Purpose",
      description: "Create emails for multiple purposes effortlessly"
    },
    {
      icon: Send,
      title: "Bulk Sending",
      description: "Personalize and send to hundreds with one click"
    },
    {
      icon: BarChart,
      title: "Track Results",
      description: "Monitor your email performance and engagement"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and never shared"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1f2937' }}>
            Everything You Need to <span style={{ color: '#3b82f6' }}>Succeed</span>
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#6b7280' }}>
            Powerful features designed to make your email workflow seamless
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="group p-8 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-2" style={{ background: 'linear-gradient(to bottom right, #f9fafb, white)', borderColor: '#e5e7eb' }}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg" style={{ background: 'linear-gradient(to bottom right, #60a5fa, #3b82f6)' }}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#1f2937' }}>{feature.title}</h3>
              <p className="leading-relaxed" style={{ color: '#6b7280' }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;