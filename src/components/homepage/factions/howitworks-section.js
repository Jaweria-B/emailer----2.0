import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Mail, Zap, Users, TrendingUp, ArrowRight, 
  CheckCircle, Clock, Shield, Briefcase, GraduationCap,
  Megaphone, Globe, Send, BarChart, Target, Star
} from 'lucide-react';

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
export default HowItWorksSection;