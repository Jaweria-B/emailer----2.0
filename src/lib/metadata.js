// src/lib/metadata.js

export const siteConfig = {
  name: "OpenPromote",
  title: "OpenPromote - AI-Powered Email Generator | Automated Email Writing",
  description: "Generate professional, personalized emails instantly with AI. Perfect for sales teams, marketers, and businesses. Free AI email writer with bulk email automation, customizable tones, and instant delivery.",
  url: "https://openpromote.uinfo.org",
  ogImage: "https://openpromote.uinfo.org/og-image.png", 
  keywords: [
    "AI email generator",
    "personalized email automation",
    "bulk email writer",
    "automated email sender",
    "AI email assistant",
    "email marketing automation",
    "sales email generator",
    "cold email generator",
    "email writing tool",
    "business email generator",
    "email template generator",
    "automated email marketing",
    "AI email copywriter",
    "personalized bulk emails",
    "email automation software"
  ],
  author: "OpenPromote by uinfo.org",
  linkedin: "https://www.linkedin.com/company/uinfo/"
};

export const generateMetadata = (page) => {
  const metadata = {
    home: {
      title: "OpenPromote - Free AI Email Generator | Write Professional Emails Instantly",
      description: "Generate professional, personalized emails in seconds with AI. Free email generator for sales, marketing, and business communication. Supports bulk email automation with customizable tones and instant delivery.",
      keywords: "AI email generator, free email writer, automated email tool, personalized emails, bulk email generator"
    },
    pricing: {
      title: "Pricing Plans - OpenPromote AI Email Generator | Free & Pro Plans",
      description: "Choose the perfect plan for your email automation needs. Start free with 50 emails/month or upgrade to Pro for unlimited emails. No credit card required for free plan.",
      keywords: "email generator pricing, AI email plans, bulk email pricing, free email automation, email tool subscription"
    },
    login: {
      title: "Sign In - OpenPromote | Access Your AI Email Generator",
      description: "Sign in to OpenPromote to access your AI-powered email generator. Manage your email campaigns, view history, and generate personalized emails instantly.",
      keywords: "email generator login, AI email tool access, email automation login"
    },
    register: {
      title: "Sign Up Free - OpenPromote | Start Generating AI Emails Today",
      description: "Create your free OpenPromote account and start generating professional emails with AI. No credit card required. Get 50 free emails per month.",
      keywords: "free email generator signup, AI email tool registration, create email automation account"
    },
    dashboard: {
      title: "Dashboard - OpenPromote | Manage Your Email Campaigns",
      description: "Access your OpenPromote dashboard to manage email campaigns, view analytics, and generate new emails with AI.",
      keywords: "email dashboard, email campaign management, email analytics"
    }
  };

  return metadata[page] || metadata.home;
};

export const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "OpenPromote",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "Email Marketing Software",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "0",
    "highPrice": "29",
    "offerCount": "2",
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": "0",
        "priceCurrency": "USD"
      },
      {
        "@type": "Offer",
        "name": "Pro Plan",
        "price": "29",
        "priceCurrency": "USD",
        "billingDuration": "P1M"
      }
    ]
  },
  "description": "AI-powered email generator for creating professional, personalized emails instantly. Perfect for sales teams, marketers, and businesses looking to automate email communication.",
  "url": "https://openpromote.uinfo.org",
  "author": {
    "@type": "Organization",
    "name": "uinfo.org",
    "url": "https://uinfo.org"
  },
  "publisher": {
    "@type": "Organization",
    "name": "uinfo.org",
    "url": "https://uinfo.org"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "150",
    "bestRating": "5",
    "worstRating": "1"
  },
  "featureList": [
    "AI-powered email generation",
    "Personalized bulk emails",
    "Multiple tone options",
    "Email history and analytics",
    "Instant email delivery",
    "Multiple AI provider support",
    "Free tier available"
  ]
};

export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "uinfo.org",
  "url": "https://uinfo.org",
  "logo": "https://uinfo.org/logo.png",
  "sameAs": [
    "https://www.linkedin.com/company/uinfo/"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "url": "https://uinfo.org/contact/"
  }
};