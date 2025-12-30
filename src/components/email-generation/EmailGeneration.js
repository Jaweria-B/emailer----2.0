"use client";
import React, { useState, useEffect } from "react";
import {
  Send,
  Copy,
  Mail,
  Settings,
  Sparkles,
  User,
  Building,
  MessageSquare,
  Clock,
  Heart,
  Briefcase,
  Shield,
  Smile,
  LogOut,
  UserPlus,
  LogIn,
  Users,
  AlertCircle,
} from "lucide-react";

import { AI_PROVIDERS, AI_PROVIDER_INFO } from "@/lib/ai-config";
import ProviderSelector from "@/components/ProviderSelector";
import EmailSender from "@/components/EmailSender";
import Footer from "@/components/Footer";
import EmailGenerationFeedback from "@/components/EmailGenerationFeedback";
import EmailSenderFeedback from "@/components/EmailSenderFeedback";
import FloatingGenerationGuide from "@/components/GenerationGuide";
import EmailOpener from "@/components/EmailOpener";
import UsageWidget from "@/components/UsageWidget";
import UpgradeModal from "@/components/UpgradeModal";
import { useRouter } from "next/navigation";
import { createPrompt } from "@/components/prompts/simple-generation/prompt";

const EmailGeneration = ({ user }) => {
  const router = useRouter();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalState, setUpgradeModalState] = useState({
    userPlan: "Free",
    hasPackage: false,
  });

  const [formData, setFormData] = useState({
    rawThoughts: "",
    tone: "professional",
    recipient: "",
    senderName: "",
    subject: "",
    context: "",
    replyingTo: "",
    priority: "normal",
    relationship: "professional",
    purpose: "general",
    length: "medium",
  });

  const [selectedProvider, setSelectedProvider] = useState(AI_PROVIDERS.GEMINI);

  const [generatedEmail, setGeneratedEmail] = useState({
    subject: "",
    body: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showEmailSender, setShowEmailSender] = useState(false);
  const [showGenerationFeedback, setShowGenerationFeedback] = useState(false);
  const [showSenderFeedback, setShowSenderFeedback] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [hasFreeEmail, setHasFreeEmail] = useState(true);
  const [isCheckingFreeEmail, setIsCheckingFreeEmail] = useState(true);

  // Check free email status on mount and when user changes
  useEffect(() => {
    if (user) {
      // For authenticated users, fetch subscription data
      fetchSubscriptionData();
      setIsCheckingFreeEmail(false);
    } else {
      // For anonymous users, check free email status
      const checkFreeEmail = async () => {
        setIsCheckingFreeEmail(true);
        try {
          const response = await fetch("/api/check-free-email");
          if (response.ok) {
            const data = await response.json();
            setHasFreeEmail(data.hasFreeEmail);
          }
        } catch (error) {
          console.error("Failed to check free email status:", error);
        } finally {
          setIsCheckingFreeEmail(false);
        }
      };

      checkFreeEmail();
    }
  }, [user]);

  const tones = [
    { value: "professional", label: "Professional", icon: Briefcase },
    { value: "friendly", label: "Friendly", icon: Smile },
    { value: "formal", label: "Formal", icon: Shield },
    { value: "warm", label: "Warm", icon: Heart },
    { value: "concise", label: "Concise", icon: Clock },
    { value: "enthusiastic", label: "Enthusiastic", icon: Sparkles },
  ];

  const priorities = [
    { value: "low", label: "Low Priority" },
    { value: "normal", label: "Normal" },
    { value: "high", label: "High Priority" },
    { value: "urgent", label: "Urgent" },
  ];

  const relationships = [
    { value: "professional", label: "Professional Colleague" },
    { value: "client", label: "Client/Customer" },
    { value: "manager", label: "Manager/Boss" },
    { value: "friend", label: "Friend" },
    { value: "unknown", label: "First Contact" },
  ];

  const purposes = [
    { value: "general", label: "General Communication" },
    { value: "request", label: "Making a Request" },
    { value: "follow-up", label: "Follow-up" },
    { value: "thank-you", label: "Thank You" },
    { value: "apology", label: "Apology" },
    { value: "invitation", label: "Invitation" },
    { value: "complaint", label: "Complaint/Issue" },
    { value: "proposal", label: "Proposal/Pitch" },
  ];

  const lengths = [
    { value: "short", label: "Short (1-2 paragraphs)" },
    { value: "medium", label: "Medium (3-4 paragraphs)" },
    { value: "long", label: "Long (5+ paragraphs)" },
  ];

  const fetchSubscriptionData = async () => {
    if (!user) return;

    setIsLoadingSubscription(true);
    try {
      const response = await fetch("/api/subscriptions/current");
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data.subscription);
        setUsageData(data.usage);
      }
    } catch (error) {
      console.error("Failed to fetch subscription data:", error);
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  // ========== PACKAGE CHECK HELPER ==========
  const checkCanGenerate = () => {
    if (!user || !subscriptionData) return { allowed: true }; // Allow anonymous/loading

    const isPro = subscriptionData.plan_name === "Pro";
    const hasPackage =
      subscriptionData.package_id &&
      subscriptionData.package_generations_remaining > 0;

    // Pro user without package
    if (isPro && !hasPackage) {
      return {
        allowed: false,
        reason: "no_package",
        message:
          "You're on the Pro plan, but you don't have an active package yet.",
        userPlan: "Pro",
        hasPackage: false,
      };
    }

    // Free user at generation limit (handled by API but check locally for UX)
    if (subscriptionData.plan_name === "Free") {
      const generationsUsed = usageData?.generations_count || 0;
      const generationLimit = subscriptionData.generation_limit || 5;

      if (generationsUsed >= generationLimit) {
        return {
          allowed: false,
          reason: "limit_reached",
          message: `You've used all ${generationLimit} of your free generations this month.`,
          userPlan: "Free",
          hasPackage: false,
        };
      }

      return {
        allowed: true,
        remaining: generationLimit - generationsUsed,
        userPlan: "Free",
      };
    }

    // Pro user with package
    if (isPro && hasPackage) {
      return {
        allowed: true,
        remaining: subscriptionData.package_generations_remaining,
        userPlan: "Pro",
        hasPackage: true,
        packageName: subscriptionData.package_name,
      };
    }

    return { allowed: true };
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
  };

  const validateInputs = () => {
    const MAX_RAW_THOUGHTS = 5000;
    const MAX_CONTEXT = 3000;
    const MAX_REPLYING_TO = 10000;
    const MAX_SUBJECT = 200;
    const MAX_RECIPIENT = 100;
    const MAX_SENDER = 100;

    if (formData.rawThoughts.length > MAX_RAW_THOUGHTS) {
      alert(
        `Your thoughts are too long. Please keep it under ${MAX_RAW_THOUGHTS} characters. Current: ${formData.rawThoughts.length}`
      );
      return false;
    }

    if (formData.context.length > MAX_CONTEXT) {
      alert(
        `Additional context is too long. Please keep it under ${MAX_CONTEXT} characters. Current: ${formData.context.length}`
      );
      return false;
    }

    if (formData.replyingTo.length > MAX_REPLYING_TO) {
      alert(
        `The email you're replying to is too long. Please keep it under ${MAX_REPLYING_TO} characters. Current: ${formData.replyingTo.length}`
      );
      return false;
    }

    if (formData.subject.length > MAX_SUBJECT) {
      alert(
        `Subject context is too long. Please keep it under ${MAX_SUBJECT} characters.`
      );
      return false;
    }

    if (formData.senderName.length > MAX_SENDER) {
      alert(
        `Your name is too long. Please keep it under ${MAX_SENDER} characters.`
      );
      return false;
    }

    return true;
  };

  const generateEmail = async () => {
    if (!formData.rawThoughts.trim()) {
      alert("Please enter your thoughts about what you want to say");
      return;
    }

    if (!validateInputs()) {
      return;
    }

    // ========== PRE-GENERATION CHECK ==========
    if (user && subscriptionData) {
      const canGenerate = checkCanGenerate();

      if (!canGenerate.allowed) {
        if (canGenerate.reason === "no_package") {
          // Pro user without package - show purchase modal
          setUpgradeModalState({
            userPlan: "Pro",
            hasPackage: false,
          });
          setShowUpgradeModal(true);
          return;
        } else if (canGenerate.reason === "limit_reached") {
          // Free user at limit - show upgrade modal
          setUpgradeModalState({
            userPlan: "Free",
            hasPackage: false,
          });
          setShowUpgradeModal(true);
          return;
        }
      }
    }

    setIsLoading(true);

    try {
      const prompt = createPrompt(formData);
      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: selectedProvider,
          prompt: prompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 403) {
          // Handle subscription/limit errors from API
          if (errorData.upgrade_required) {
            // Check if it's a package requirement
            if (errorData.needs_package) {
              setUpgradeModalState({
                userPlan: "Pro",
                hasPackage: false,
              });
            } else {
              setUpgradeModalState({
                userPlan: "Free",
                hasPackage: false,
              });
            }
            setShowUpgradeModal(true);
            return;
          }

          // Handle anonymous user (free email used up)
          setHasFreeEmail(false);
          if (confirm(errorData.error + " Would you like to sign in now?")) {
            router.push("/login");
          }
          return;
        }

        // User-friendly error message for all other errors
        alert(
          "We're experiencing high demand right now. Please try generating your email again in a moment."
        );
        return;
      }

      const result = await response.json();
      setGeneratedEmail(result);

      // If user is not logged in, they just used their free email
      if (!user) {
        setHasFreeEmail(false);
      } else {
        // Refresh subscription data to show updated usage
        await fetchSubscriptionData();
      }

      // Save activity to database only for authenticated users
      if (user) {
        await saveEmailActivity(result);
      }

      setTimeout(() => {
        setShowGenerationFeedback(true);
      }, 1500);
    } catch (error) {
      // Log error for debugging but show friendly message
      console.error("Error generating email:", error);
      alert(
        "Something went wrong while crafting your email. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const fullEmail = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
      await navigator.clipboard.writeText(fullEmail);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const openEmailSender = () => {
    if (!generatedEmail.subject || !generatedEmail.body) {
      alert("Please generate an email first before sending");
      return;
    }
    setShowEmailSender(true);
  };

  const saveEmailActivity = async (emailData) => {
    try {
      await fetch("/api/email-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: emailData.subject,
          body: emailData.body,
          recipient: formData.recipient,
          tone: formData.tone,
          ai_provider: selectedProvider,
          purpose: formData.purpose,
          priority: formData.priority,
          status: "generated",
        }),
      });
    } catch (error) {
      console.error("Failed to save email activity:", error);
    }
  };

  const handleGenerationFeedback = async (feedbackData) => {
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "email_generation",
          feedback: feedbackData,
          ai_provider: selectedProvider,
          user_id: user?.id,
        }),
      });
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  const handleSenderFeedback = async (feedbackData) => {
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "email_sender",
          feedback: feedbackData,
          email_sent: emailSent,
          user_id: user?.id,
        }),
      });
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  if (showEmailSender) {
    return (
      <>
        <EmailSender
          subject={generatedEmail.subject}
          body={generatedEmail.body}
          onBack={() => setShowEmailSender(false)}
          onEmailSent={(success) => {
            setEmailSent(success);
            setTimeout(() => {
              setShowSenderFeedback(true);
            }, 1000);
          }}
        />
      </>
    );
  }

  // ========== RENDER SECTION ==========
  return (
    <div>
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Input Section */}
        <div className="bg-[color:var(--primary-color)] rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-white" />
            Email Details
          </h2>

          <div className="space-y-6">
            {/* Status Banner - Show different messages based on user state */}
            {user && subscriptionData && (
              <div
                className={`rounded-xl p-4 border ${
                  subscriptionData.plan_name === "Pro"
                    ? "bg-amber-500/20 border-amber-500/30"
                    : "bg-green-500/20 border-green-500/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                      subscriptionData.plan_name === "Pro"
                        ? "text-amber-200"
                        : "text-green-200"
                    }`}
                  />
                  <div>
                    {/* <h3 className="text-white font-semibold mb-1">
                                            {subscriptionData.plan_name === 'Free' ? '📊 Free Plan' : '🚀 Pro Plan'}
                                        </h3> */}
                    {subscriptionData.plan_name === "Free" ? (
                      <p className="text-green-100 text-sm">
                        {subscriptionData.generation_limit -
                          (usageData?.generations_count || 0)}
                        /{subscriptionData.generation_limit} generations
                        remaining this month
                      </p>
                    ) : (
                      <p className="text-amber-100 text-sm">
                        {subscriptionData.package_id &&
                        subscriptionData.package_generations_remaining > 0 ? (
                          <>
                            {subscriptionData.package_generations_remaining}{" "}
                            generations left in {subscriptionData.package_name}{" "}
                            package
                          </>
                        ) : (
                          <>
                            No active package.{" "}
                            <button
                              onClick={() => router.push("/packages")}
                              className="underline font-semibold hover:text-white"
                            >
                              Purchase a package
                            </button>{" "}
                            to start generating.
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!user &&
              !isCheckingFreeEmail &&
              (hasFreeEmail ? (
                <div className="rounded-xl p-4 bg-white/20 border border-white/30">
                  <div className="flex items-center gap-2 text-white">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-semibold">
                      Free email generation available
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-white/90">
                    Try our AI email generator - no sign up required!
                  </p>
                </div>
              ) : (
                <div className="rounded-xl p-4 bg-white/20 border border-white/30">
                  <div className="flex items-center gap-2 text-white">
                    <Shield className="h-4 w-4" />
                    <span className="font-semibold">
                      Free email limit reached
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-white/90">
                    Please{" "}
                    <button
                      onClick={() => router.push("/login")}
                      className="underline font-semibold hover:text-white"
                    >
                      sign in
                    </button>{" "}
                    to continue generating emails.
                  </p>
                </div>
              ))}

            {/* Raw Thoughts */}
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Email Brief *
              </label>
              <textarea
                value={formData.rawThoughts}
                onChange={(e) =>
                  handleInputChange("rawThoughts", e.target.value)
                }
                placeholder="Describe what you want to communicate and why. Provide key points, etc."
                rows={4}
                className="w-full bg-white border border-white/30 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all resize-none"
                disabled={!user && !hasFreeEmail}
              />
            </div>

            {/* Subject Context */}
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Subject Context
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                placeholder="e.g., Project update, Meeting request, Follow-up"
                className="w-full bg-white border border-white/30 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                disabled={!user && !hasFreeEmail}
              />
            </div>

            {/* Sender Name */}
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                <User className="h-4 w-4 inline mr-1 text-white" />
                Your Name
              </label>
              <input
                type="text"
                value={formData.senderName}
                onChange={(e) =>
                  handleInputChange("senderName", e.target.value)
                }
                placeholder="e.g., John Doe, Sarah Johnson"
                className="w-full bg-white border border-white/30 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                disabled={!user && !hasFreeEmail}
              />
            </div>

            {/* Tone Selection */}
            <div>
              <label className="block text-white text-sm font-semibold mb-3">
                Tone
              </label>
              <div className="grid grid-cols-2 gap-3">
                {tones.map((tone) => {
                  const IconComponent = tone.icon;
                  return (
                    <button
                      key={tone.value}
                      onClick={() => handleInputChange("tone", tone.value)}
                      disabled={!user && !hasFreeEmail}
                      className={`p-3 rounded-xl border transition-all duration-200 flex items-center gap-2 ${
                        formData.tone === tone.value
                          ? "bg-white text-[color:var(--primary-color)] border-white shadow-md font-semibold"
                          : "bg-white/20 border-white/30 text-white hover:bg-white/30"
                      } ${
                        !user && !hasFreeEmail
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm font-medium">{tone.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Relationship with Recipient
              </label>
              <select
                value={formData.relationship}
                onChange={(e) =>
                  handleInputChange("relationship", e.target.value)
                }
                className="w-full bg-white border border-white/30 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                disabled={!user && !hasFreeEmail}
              >
                {relationships.map((rel) => (
                  <option key={rel.value} value={rel.value}>
                    {rel.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Email Purpose
              </label>
              <select
                value={formData.purpose}
                onChange={(e) => handleInputChange("purpose", e.target.value)}
                className="w-full bg-white border border-white/30 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                disabled={!user && !hasFreeEmail}
              >
                {purposes.map((purpose) => (
                  <option key={purpose.value} value={purpose.value}>
                    {purpose.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority and Length */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange("priority", e.target.value)
                  }
                  className="w-full bg-white border border-white/30 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  disabled={!user && !hasFreeEmail}
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Length
                </label>
                <select
                  value={formData.length}
                  onChange={(e) => handleInputChange("length", e.target.value)}
                  className="w-full bg-white border border-white/30 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  disabled={!user && !hasFreeEmail}
                >
                  {lengths.map((length) => (
                    <option key={length.value} value={length.value}>
                      {length.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Context */}
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Additional Context
              </label>
              <textarea
                value={formData.context}
                onChange={(e) => handleInputChange("context", e.target.value)}
                placeholder="Any additional context, background information, or specific requirements..."
                rows={3}
                className="w-full bg-white border border-white/30 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all resize-none"
                disabled={!user && !hasFreeEmail}
              />
            </div>

            {/* Replying To (Optional) */}
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Replying to this email (optional)
              </label>
              <textarea
                value={formData.replyingTo}
                onChange={(e) =>
                  handleInputChange("replyingTo", e.target.value)
                }
                placeholder="Paste the email you're replying to here..."
                rows={4}
                className="w-full bg-white border border-white/30 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all resize-none"
                disabled={!user && !hasFreeEmail}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={generateEmail}
              disabled={isLoading || (!user && !hasFreeEmail)}
              className="w-full bg-white text-[color:var(--primary-color)] hover:bg-white/90 font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[color:var(--primary-color)]"></div>
                  Crafting with EmailCurator...
                </>
              ) : (
                <>
                  {user
                    ? `Generate Email with EmailCurator`
                    : hasFreeEmail
                    ? `Try Free Generation with EmailCurator`
                    : "Sign In to Generate Email"}
                </>
              )}
            </button>

            {/* Optional: Sign in prompt below button for non-authenticated users without free email */}
            {!user && !hasFreeEmail && (
              <p className="text-center text-sm text-white/90">
                <button
                  onClick={() => router.push("/login")}
                  className="underline hover:text-white font-medium"
                >
                  Sign in
                </button>{" "}
                or{" "}
                <button
                  onClick={() => router.push("/signup")}
                  className="underline hover:text-white font-medium"
                >
                  create an account
                </button>{" "}
                to continue generating emails
              </p>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="bg-[color:var(--primary-color)] rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Send className="h-6 w-6 text-white" />
              Generated Email
            </h2>

            <div className="flex flex-col sm:flex-row gap-2">
              {(generatedEmail.subject || generatedEmail.body) && (
                <button
                  onClick={openEmailSender}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-[color:var(--primary-color)] hover:bg-white/90 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Email</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white/10 rounded-xl border border-white/20 p-4 lg:p-6 min-h-[300px] sm:min-h-[400px]">
            {generatedEmail.subject || generatedEmail.body ? (
              <div
                className="text-white space-y-4 select-none"
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
              >
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white/90 mb-2">
                    Subject:
                  </h3>
                  <div className="bg-white rounded-lg p-3 break-words">
                    <p className="text-sm sm:text-base leading-relaxed text-gray-900">
                      {generatedEmail.subject}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white/90 mb-2">
                    Email Body:
                  </h3>
                  <div className="bg-white rounded-lg p-3 overflow-hidden">
                    <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base break-words overflow-wrap-anywhere text-gray-900">
                      {generatedEmail.body}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <EmailOpener
                    subject={generatedEmail.subject}
                    body={generatedEmail.body}
                    recipient={formData.recipient}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-white px-4">
                <div className="text-center max-w-sm">
                  <Mail className="h-16 w-16 mx-auto mb-4 opacity-50 text-white" />
                  <p className="text-lg mb-2 text-white font-medium">
                    Your generated email will appear here
                  </p>
                  <p className="text-sm opacity-75 leading-relaxed text-white/90">
                    {user
                      ? "Fill in the details and click 'Generate Email'"
                      : hasFreeEmail
                      ? "Fill in the details and try your free generation"
                      : "Sign in to generate professional emails"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center my-12">
        <p className="text-gray-600 text-sm">
          Powered by OpenPromote • Professional AI email generation service
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Multi-AI email generation with professional quality results
        </p>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          userPlan={upgradeModalState.userPlan}
          hasPackage={upgradeModalState.hasPackage}
        />
      )}
    </div>
  );
};

export default EmailGeneration;
