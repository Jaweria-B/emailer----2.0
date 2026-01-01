"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  User,
  Calendar,
  Activity,
  LogOut,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Crown,
  ArrowRight,
  CheckCircle2,
  Wallet,
  Package,
  Send,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/AuthProvider";
import PageWrapper from "@/components/PageWrapper";
import Button from "@/components/button";
import LinkButton from "@/components/linkButton";

const Dashboard = () => {
  const { user, isLoadingUser, handleLogout: contextLogout } = useAuthContext();
  const [emailHistory, setEmailHistory] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [packageData, setPackageData] = useState(null);
  const [stats, setStats] = useState({
    totalEmails: 0,
    emailsThisMonth: 0,
    favoriteProvider: "",
    mostUsedTone: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const calculateStats = useCallback((emails) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const emailsThisMonth = emails.filter((email) => {
      const emailDate = new Date(email.created_at);
      return (
        emailDate.getMonth() === currentMonth &&
        emailDate.getFullYear() === currentYear
      );
    }).length;

    const providerCount = {};
    const toneCount = {};

    emails.forEach((email) => {
      providerCount[email.ai_provider] =
        (providerCount[email.ai_provider] || 0) + 1;
      toneCount[email.tone] = (toneCount[email.tone] || 0) + 1;
    });

    const favoriteProvider = Object.keys(providerCount).reduce(
      (a, b) => (providerCount[a] > providerCount[b] ? a : b),
      ""
    );

    const mostUsedTone = Object.keys(toneCount).reduce(
      (a, b) => (toneCount[a] > toneCount[b] ? a : b),
      ""
    );

    setStats({
      totalEmails: emails.length,
      emailsThisMonth,
      favoriteProvider,
      mostUsedTone,
    });
  }, []);

  const loadEmailHistory = useCallback(async () => {
    try {
      const response = await fetch("/api/email-history");
      if (response.ok) {
        const data = await response.json();
        setEmailHistory(data.emails);
        calculateStats(data.emails);
      }
    } catch (error) {
      console.error("Failed to load email history:", error);
    }
  }, [calculateStats]);

  const loadSubscriptionData = useCallback(async () => {
    if (!user) return;

    setIsLoadingSubscription(true);
    try {
      // Fetch user data including package info
      const response = await fetch("/api/package-info"); // New endpoint we'll create

      if (response.ok) {
        const data = await response.json();
        setUsageData(data);
      }
    } catch (error) {
      console.error("Failed to fetch package data:", error);
    } finally {
      setIsLoadingSubscription(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push("/login");
    }
  }, [user, isLoadingUser, router]);

  useEffect(() => {
    if (user) {
      Promise.all([loadEmailHistory(), loadSubscriptionData()]).finally(() =>
        setIsLoading(false)
      );
    }
  }, [user, loadEmailHistory, loadSubscriptionData]);

  // Listen for visibility change - refresh when user comes back to dashboard
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // User came back to this tab, refresh data
        loadSubscriptionData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user, loadSubscriptionData]);

  const handleLogout = async () => {
    await contextLogout();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--background-secondary)" }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "var(--primary-color)" }}
          ></div>
          <p style={{ color: "var(--text-secondary)" }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const isFree = subscriptionData?.plan_name === "Free";
  const isPro = subscriptionData?.plan_name === "Pro";
  const hasPackage = isPro && packageData?.package_id;

  return (
    <PageWrapper>
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--background-secondary)" }}
      >
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 md:gap-4">
              <div
                className="rounded-full p-2 md:p-3 shadow-md"
                style={{ backgroundColor: "var(--primary-color)" }}
              >
                <User className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h1
                  className="text-xl md:text-3xl font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  Welcome back, {user?.name}!
                </h1>
                <p
                  className="text-sm md:text-base truncate max-w-[200px] md:max-w-none"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2 md:gap-3">
              <Button
                onClick={() => router.push("/emailcurator/generate-email")}
                variant="primary"
                icon={<MessageSquare className="h-4 w-4 md:h-5 md:w-5" />}
                className="text-sm md:text-base"
              >
                Create Email
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                icon={<LogOut className="h-4 w-4" />}
                className="text-sm md:text-base"
              >
                Sign Out
              </Button>
            </div>
          </div>

          {/* Warning Banners */}
          {isPro && !hasPackage && (
            <div className="mb-6">
              <div
                className="rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                style={{
                  backgroundColor: "var(--warning-light)",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "var(--warning)",
                }}
              >
                <AlertTriangle
                  className="h-5 w-5 flex-shrink-0"
                  style={{ color: "var(--warning)" }}
                />
                <div className="flex-1">
                  <p
                    className="font-medium text-sm sm:text-base"
                    style={{ color: "var(--warning)" }}
                  >
                    No active package! Purchase a package to start generating
                    emails.
                  </p>
                </div>
                <LinkButton
                  href="/packages"
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Browse Packages
                </LinkButton>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {/* Card 1: Generations/Package Status */}
            <div
              className="bg-white rounded-xl border shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow"
              style={{ borderColor: "var(--border-light)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "var(--primary-lightest)" }}
                >
                  {isPro ? (
                    <Package
                      className="h-6 w-6 sm:h-7 sm:w-7"
                      style={{ color: "var(--primary-color)" }}
                    />
                  ) : (
                    <Mail
                      className="h-6 w-6 sm:h-7 sm:w-7"
                      style={{ color: "var(--primary-color)" }}
                    />
                  )}
                </div>
                <div>
                  <p
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {isPro ? "Package Status" : "Email Generations"}
                  </p>
                  <p
                    className="text-xl sm:text-2xl font-bold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {isFree && usageData
                      ? `${usageData.generations_used}/${usageData.generations_limit}`
                      : isPro && hasPackage
                      ? `${usageData.package_generations_remaining || 0}`
                      : "0"}
                  </p>
                </div>
              </div>
              <div
                className="mt-3 pt-3"
                style={{
                  borderTopWidth: "1px",
                  borderTopStyle: "solid",
                  borderTopColor: "var(--border-light)",
                }}
              >
                <p
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {isFree && usageData
                    ? `${usageData.generations_remaining} remaining`
                    : isPro && hasPackage
                    ? `${packageData.package_name} package`
                    : "No package active"}
                </p>
              </div>
            </div>

            {/* Card 2: Daily Sends (Pro) or This Month (Free) */}
            <div
              className="bg-white rounded-xl border shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow"
              style={{ borderColor: "var(--border-light)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "#d1fae5" }}
                >
                  {isPro ? (
                    <Send
                      className="h-6 w-6 sm:h-7 sm:w-7"
                      style={{ color: "var(--success)" }}
                    />
                  ) : (
                    <Calendar
                      className="h-6 w-6 sm:h-7 sm:w-7"
                      style={{ color: "var(--success)" }}
                    />
                  )}
                </div>
                <div>
                  <p
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {isPro ? "Daily Sends" : "This Month"}
                  </p>
                  <p
                    className="text-xl sm:text-2xl font-bold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {isPro && usageData
                      ? `${usageData.daily_sends_used || 0}/${
                          usageData.max_daily_sends || 200
                        }`
                      : stats.emailsThisMonth}
                  </p>
                </div>
              </div>
              <div
                className="mt-3 pt-3"
                style={{
                  borderTopWidth: "1px",
                  borderTopStyle: "solid",
                  borderTopColor: "var(--border-light)",
                }}
              >
                <p
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {isPro && usageData
                    ? `${usageData.daily_sends_remaining || 0} remaining today`
                    : "Emails this month"}
                </p>
              </div>
            </div>

            {/* Card 3: Current Plan */}
            <div
              className="bg-white rounded-xl border shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow"
              style={{ borderColor: "var(--border-light)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "#f3e8ff" }}
                >
                  <Crown
                    className="h-6 w-6 sm:h-7 sm:w-7"
                    style={{ color: "#9333ea" }}
                  />
                </div>
                <div>
                  <p
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Current Plan
                  </p>
                  <p
                    className="text-xl sm:text-2xl font-bold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {subscriptionData?.plan_name || "Free"}
                  </p>
                </div>
              </div>
              {isFree && (
                <div
                  className="mt-3 pt-3"
                  style={{
                    borderTopWidth: "1px",
                    borderTopStyle: "solid",
                    borderTopColor: "var(--border-light)",
                  }}
                >
                  <LinkButton
                    href="/pricing"
                    variant="text"
                    className="text-xs font-medium flex items-center gap-1"
                    style={{ color: "var(--primary-color)" }}
                  >
                    Upgrade to Pro
                    <ArrowRight className="h-3 w-3" />
                  </LinkButton>
                </div>
              )}
            </div>

            {/* Card 4: Total Emails */}
            <div
              className="bg-white rounded-xl border shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow"
              style={{ borderColor: "var(--border-light)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "#dbeafe" }}
                >
                  <TrendingUp
                    className="h-6 w-6 sm:h-7 sm:w-7"
                    style={{ color: "#3b82f6" }}
                  />
                </div>
                <div>
                  <p
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Total Generated
                  </p>
                  <p
                    className="text-xl sm:text-2xl font-bold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {stats.totalEmails}
                  </p>
                </div>
              </div>
              <div
                className="mt-3 pt-3"
                style={{
                  borderTopWidth: "1px",
                  borderTopStyle: "solid",
                  borderTopColor: "var(--border-light)",
                }}
              >
                <p
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  All time
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Overview */}
          <div
            className="bg-white rounded-xl border shadow-lg p-4 sm:p-6 mb-8"
            style={{ borderColor: "var(--border-light)" }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
              <h2
                className="text-xl sm:text-2xl font-bold flex items-center gap-3"
                style={{ color: "var(--foreground)" }}
              >
                <Activity
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  style={{ color: "var(--primary-color)" }}
                />
                {isPro ? "Package Overview" : "Subscription Overview"}
              </h2>
              {isPro && hasPackage ? (
                <LinkButton
                  href="/packages"
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Buy More
                </LinkButton>
              ) : isPro && !hasPackage ? (
                <LinkButton
                  href="/packages"
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Purchase Package
                </LinkButton>
              ) : (
                <LinkButton
                  href="/pricing"
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  View Plans
                </LinkButton>
              )}
            </div>

            {/* FREE PLAN DISPLAY */}
            {isFree && usageData && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="font-medium text-sm sm:text-base"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Email Generations
                    </span>
                    <span
                      className="font-bold text-sm sm:text-base"
                      style={{ color: "var(--foreground)" }}
                    >
                      {usageData.generations_used} /{" "}
                      {usageData.generations_limit}
                    </span>
                  </div>
                  <div
                    className="rounded-full h-2 sm:h-3 overflow-hidden"
                    style={{ backgroundColor: "var(--gray-200)" }}
                  >
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          (usageData.generations_used /
                            usageData.generations_limit) *
                            100,
                          100
                        )}%`,
                        backgroundColor:
                          usageData.generations_remaining <= 1
                            ? "var(--error)"
                            : usageData.generations_remaining <= 2
                            ? "var(--warning)"
                            : "var(--success)",
                      }}
                    />
                  </div>
                  <p
                    className="text-xs sm:text-sm mt-2"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {usageData.generations_remaining} generations remaining
                  </p>
                </div>
              </div>
            )}

            {/* PRO PLAN DISPLAY */}
            {isPro && hasPackage && usageData && (
              <div className="space-y-6">
                {/* Package Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="font-medium text-sm sm:text-base"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Package Generations
                    </span>
                    <span
                      className="font-bold text-sm sm:text-base"
                      style={{ color: "var(--foreground)" }}
                    >
                      {usageData.package_generations_remaining || 0} remaining
                    </span>
                  </div>
                  <div
                    className="rounded-xl p-4"
                    style={{ backgroundColor: "var(--background-secondary)" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {packageData.package_name}
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--foreground)" }}
                      >
                        {usageData.package_sends_per_email || 0} sends/email
                      </span>
                    </div>
                  </div>
                </div>

                {/* Daily Sends Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="font-medium text-sm sm:text-base"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Daily Sends (resets tomorrow)
                    </span>
                    <span
                      className="font-bold text-sm sm:text-base"
                      style={{ color: "var(--foreground)" }}
                    >
                      {usageData.daily_sends_used || 0} /{" "}
                      {usageData.max_daily_sends || 200}
                    </span>
                  </div>
                  <div
                    className="rounded-full h-2 sm:h-3 overflow-hidden"
                    style={{ backgroundColor: "var(--gray-200)" }}
                  >
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          ((usageData.daily_sends_used || 0) /
                            (usageData.max_daily_sends || 200)) *
                            100,
                          100
                        )}%`,
                        backgroundColor:
                          (usageData.daily_sends_remaining || 0) <= 20
                            ? "var(--error)"
                            : (usageData.daily_sends_remaining || 0) <= 50
                            ? "var(--warning)"
                            : "var(--success)",
                      }}
                    />
                  </div>
                  <p
                    className="text-xs sm:text-sm mt-2"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {usageData.daily_sends_remaining || 0} sends remaining today
                  </p>
                </div>
              </div>
            )}

            {/* PRO WITHOUT PACKAGE */}
            {isPro && !hasPackage && (
              <div className="text-center py-8">
                <Package
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: "var(--text-tertiary)" }}
                />
                <p
                  className="text-lg font-medium mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  No Active Package
                </p>
                <p
                  className="text-sm mb-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Purchase a package to start generating emails
                </p>
                <LinkButton href="/packages" variant="primary">
                  Browse Packages
                </LinkButton>
              </div>
            )}

            {/* Period Info */}
            <div
              className="mt-6 pt-4"
              style={{
                borderTopWidth: "1px",
                borderTopStyle: "solid",
                borderTopColor: "var(--border-light)",
              }}
            >
              <p
                className="text-xs sm:text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                {isFree
                  ? `Billing period resets on ${new Date(
                      subscriptionData?.current_period_end
                    ).toLocaleDateString()}`
                  : hasPackage
                  ? `Package purchased on ${new Date(
                      packageData?.purchased_at
                    ).toLocaleDateString()}`
                  : `Pro plan active`}
              </p>
            </div>
          </div>

          {/* Email History */}
          <div
            className="bg-white rounded-xl border shadow-lg p-6"
            style={{ borderColor: "var(--border-light)" }}
          >
            <h2
              className="text-2xl font-bold mb-6 flex items-center gap-3"
              style={{ color: "var(--foreground)" }}
            >
              <Mail
                className="h-6 w-6"
                style={{ color: "var(--primary-color)" }}
              />
              Recent Emails
            </h2>

            {emailHistory.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {emailHistory.map((email) => (
                  <div
                    key={email.id}
                    className="rounded-lg p-4 border hover:shadow-md transition-shadow"
                    style={{
                      backgroundColor: "var(--background-secondary)",
                      borderColor: "var(--border-light)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3
                          className="font-medium text-lg mb-1"
                          style={{ color: "var(--foreground)" }}
                        >
                          {email.email_subject || "Untitled Email"}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: "var(--primary-lightest)",
                              color: "var(--primary-active)",
                            }}
                          >
                            {email.tone}
                          </span>
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: "#dbeafe",
                              color: "#1e40af",
                            }}
                          >
                            {email.ai_provider}
                          </span>
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: "var(--success-light)",
                              color: "var(--success)",
                            }}
                          >
                            {email.status}
                          </span>
                        </div>
                        {email.recipient && (
                          <p
                            className="text-sm mb-2"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            To: {email.recipient}
                          </p>
                        )}
                      </div>
                      <div
                        className="text-sm whitespace-nowrap ml-4"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {formatDate(email.created_at)}
                      </div>
                    </div>

                    {email.email_body && (
                      <div
                        className="rounded-lg p-3 mt-3"
                        style={{ backgroundColor: "var(--background)" }}
                      >
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {email.email_body.length > 200
                            ? email.email_body.substring(0, 200) + "..."
                            : email.email_body}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Mail
                  className="h-16 w-16 mx-auto mb-4 opacity-30"
                  style={{ color: "var(--text-tertiary)" }}
                />
                <p
                  className="text-lg mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  No emails generated yet
                </p>
                <p
                  className="text-sm mb-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Start creating your first email!
                </p>
                <Button
                  onClick={() => router.push("/emailcurator/generate-email")}
                  variant="primary"
                  icon={<MessageSquare className="h-5 w-5" />}
                >
                  Create First Email
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
