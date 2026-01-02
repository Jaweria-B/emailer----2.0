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
  Target,
  Globe,
  Send,
  BarChart,
  Star,
  Briefcase,
  GraduationCap,
  Megaphone,
  Building,
} from "lucide-react";
import Button from "@/components/button";
import LinkButton from "@/components/linkButton";

const CTASection = () => {
  return (
    <section
      className="py-24 text-white"
      style={{
        background:
          "linear-gradient(135deg, #dbeafe 0%, #e0f2fe 50%, #f0f9ff 100%)",
      }}
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Ready to Transform Your Emails?
        </h2>
        <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-3xl mx-auto">
          Join thousands already saving time and crafting better emails with AI
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            className="bg-white hover:bg-white"
            style={{ color: "#3b82f6" }}
          >
            Start Free Now
          </Button>
          <LinkButton
            href="/pricing"
            variant="outline"
            size="lg"
            className="border-2 border-white text-white hover:bg-white"
            style={{ color: "white" }}
          >
            View Pricing
          </LinkButton>
        </div>
        <p className="mt-8 opacity-90">
          No credit card required • Free forever plan available
        </p>
      </div>
    </section>
  );
};
export default CTASection;
