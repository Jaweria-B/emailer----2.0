import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Mail,
  Zap,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
  Briefcase,
  GraduationCap,
  Megaphone,
  Globe,
  Send,
  BarChart,
  Target,
  Star,
} from "lucide-react";

const BenefitsSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const audiences = [
    {
      icon: Briefcase,
      label: "Professionals",
      title: "Elevate Your Professional Communication",
      benefits: [
        "Transform hours of email drafting into minutes with AI precision",
        "Close deals faster with persuasive, personalized outreach",
        "Never miss a follow-up with intelligent reminder sequences",
        "Build stronger relationships through consistently polished communication",
      ],
      gradientClass: "gradient-marketer",
    },
    {
      icon: GraduationCap,
      label: "Students",
      title: "Ace Your Academic Communication",
      benefits: [
        "Stand out in scholarship applications with compelling narratives",
        "Connect with professors and mentors using confident, professional tone",
        "Land internships with emails that showcase your unique value",
        "Build your professional network before graduation",
      ],
      gradientClass: "gradient-marketer",
    },
    {
      icon: Megaphone,
      label: "Marketers",
      title: "Scale Your Email Campaigns",
      benefits: [
        "Generate campaign-ready emails at 10x the speed of manual writing",
        "Boost engagement with data-driven subject lines and CTAs",
        "Test multiple variations instantly to optimize conversion rates",
        "Maintain brand voice consistency across thousands of emails",
      ],
      gradientClass: "gradient-marketer",
    },
    {
      icon: Users,
      label: "Businesses",
      title: "Streamline Team Communication",
      benefits: [
        "Scale customer outreach without expanding your team",
        "Ensure every client interaction reflects your brand excellence",
        "Reduce response time from hours to minutes with templates",
        "Empower every team member to communicate like a seasoned pro",
      ],
      gradientClass: "gradient-marketer",
    },
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
            Whether you're a student, professional, or business owner - we've
            got you covered
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
                  ? `${audience.gradientClass} text-white shadow-lg scale-105`
                  : "bg-white text-gray-700 hover:shadow-md"
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
            <div className={`p-12 ${active.gradientClass} text-white`}>
              <active.icon className="w-16 h-16 mb-6 opacity-90" />
              <h3 className="text-3xl font-bold mb-6">{active.title}</h3>
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
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <Mail className="w-16 h-16 text-blue-600" />
                </div>
                <p className="text-gray-600 text-lg mb-6">
                  Join thousands of {active.label.toLowerCase()} already using
                  OpenPromote
                </p>
                <button
                  onClick={() =>
                    (window.location.href = "/emailcurator/generate-email")
                  }
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
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

export default BenefitsSection;
