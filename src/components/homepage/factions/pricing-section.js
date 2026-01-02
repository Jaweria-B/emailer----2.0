"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  Loader2,
  Sparkles,
  Crown,
  Package as PackageIcon,
  Mail,
  Zap,
  AlertCircle,
  Package2,
  PackageOpen,
} from "lucide-react";
import Button from "@/components/button";
import LinkButton from "@/components/linkButton";
import { useAuthContext } from "@/providers/AuthProvider";

const PricingSection = () => {
  return (
    <section
      id="pricing-section"
      className="py-20 bg-gradient-to-br from-gray-50 to-purple-50"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: "#1f2937" }}
          >
            Choose Your Package
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: "#6b7280" }}>
            Simple one-time payments. Use until depleted. No subscriptions.
          </p>
        </div>

        {/* Stripe Pricing Table Embed */}
        <div className="max-w-6xl mx-auto">
          <script
            async
            src="https://js.stripe.com/v3/pricing-table.js"
          ></script>
          <stripe-pricing-table
            pricing-table-id="prctbl_1SkanoAHUjxYWLMNJkgkBRLr"
            publishable-key="pk_test_51O3yNhAHUjxYWLMNB3iR464al7uMaTieD6Rc75cKTHZyji6m8uqgp5Nz6yfmhLb48G5dPE0eXsf8tSxPbE2sZd55004naP4xi0"
          ></stripe-pricing-table>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
