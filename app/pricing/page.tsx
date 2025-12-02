/** @format */

"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { AIChatbot } from "@/components/ai-chatbot";
import {
  Check,
  X,
  Zap,
  TrendingUp,
  Building2,
  Sparkles,
  Users,
  Package,
  FileText,
  BarChart3,
  Shield,
  Headphones,
} from "lucide-react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const plans = [
    {
      name: "Free",
      tagline: "Perfect to get started",
      price: 0,
      yearlyPrice: 0,
      popular: false,
      icon: Sparkles,
      color: "from-gray-500 to-gray-600",
      features: [
        { text: "10 Customers", included: true },
        { text: "10 Products", included: true },
        { text: "5 Invoices/month", included: true },
        { text: "Basic Dashboard", included: true },
        { text: "Mobile Access", included: true },
        { text: "Email Support", included: true },
        { text: "AI Insights", included: false },
        { text: "Voice Input", included: false },
        { text: "Multi-user Access", included: false },
        { text: "Priority Support", included: false },
      ],
      cta: "Start Free",
      description: "Test without risk. No credit card required.",
    },
    {
      name: "Starter",
      tagline: "For small businesses",
      price: 800,
      yearlyPrice: 8000,
      popular: false,
      icon: Zap,
      color: "from-blue-500 to-blue-600",
      features: [
        { text: "100 Customers", included: true },
        { text: "100 Products", included: true },
        { text: "Unlimited Invoices", included: true },
        { text: "Advanced Dashboard", included: true },
        { text: "Mobile Access", included: true },
        { text: "AI Insights (10/month)", included: true },
        { text: "Voice Input", included: true },
        { text: "Inventory Management", included: true },
        { text: "Expense Tracking", included: true },
        { text: "Multi-user Access", included: false },
        { text: "Priority Support", included: false },
      ],
      cta: "Get Started",
      description: "Just Rs. 27/day. Less than a cup of chai!",
    },
    {
      name: "Pro",
      tagline: "Most Popular",
      price: 1500,
      yearlyPrice: 15000,
      popular: true,
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
      features: [
        { text: "Unlimited Customers", included: true },
        { text: "Unlimited Products", included: true },
        { text: "Unlimited Invoices", included: true },
        { text: "Advanced Dashboard", included: true },
        { text: "Mobile Access", included: true },
        { text: "Unlimited AI Insights", included: true },
        { text: "Voice Input", included: true },
        { text: "Inventory Management", included: true },
        { text: "Expense Tracking", included: true },
        { text: "Employee Management", included: true },
        { text: "Multi-user Access (3 users)", included: true },
        { text: "Excel Export", included: true },
        { text: "Priority Support", included: true },
      ],
      cta: "Start Pro",
      description: "Rs. 50/day. Perfect for growing businesses.",
    },
    {
      name: "Business",
      tagline: "For multi-branch operations",
      price: 3000,
      yearlyPrice: 30000,
      popular: false,
      icon: Building2,
      color: "from-purple-500 to-purple-600",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "Unlimited Users", included: true },
        { text: "Multi-branch Support", included: true },
        { text: "Advanced Analytics", included: true },
        { text: "Custom Reports", included: true },
        { text: "API Access", included: true },
        { text: "White-label Option", included: true },
        { text: "Dedicated Support", included: true },
        { text: "Training Sessions", included: true },
        { text: "Custom Integrations", included: true },
      ],
      cta: "Contact Sales",
      description: "Rs. 100/day. Enterprise-grade solution.",
    },
  ];

  const getPrice = (plan: (typeof plans)[0]) => {
    if (plan.price === 0) return "Free";
    const price = billingCycle === "monthly" ? plan.price : plan.yearlyPrice;
    return `Rs. ${price.toLocaleString()}`;
  };

  const getPeriod = () => {
    return billingCycle === "monthly" ? "/month" : "/year";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 overflow-y-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 via-background to-purple-500/10">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Simple, Transparent Pricing
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
                Choose Your Perfect Plan
              </h1>

              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Start free, upgrade when you grow. No hidden fees, no surprises.
                Built for Pakistani businesses.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 pt-4">
                <span
                  className={`text-sm font-medium ${
                    billingCycle === "monthly"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Monthly
                </span>
                <button
                  onClick={() =>
                    setBillingCycle(
                      billingCycle === "monthly" ? "yearly" : "monthly"
                    )
                  }
                  className="relative inline-flex h-8 w-14 items-center rounded-full bg-orange-500 transition-colors"
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      billingCycle === "yearly"
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
                <span
                  className={`text-sm font-medium ${
                    billingCycle === "yearly"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Yearly
                  <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                    Save 17%
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <div
                  key={index}
                  className={`relative rounded-2xl border ${
                    plan.popular
                      ? "border-orange-500 shadow-2xl shadow-orange-500/20 scale-105"
                      : "border-border/40"
                  } bg-card p-8 transition-all duration-300 hover:shadow-xl hover:scale-105`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="px-4 py-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold shadow-lg">
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.color} mb-6`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {plan.tagline}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-foreground">
                        {getPrice(plan)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground">
                          {getPeriod()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {plan.description}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 mb-8 ${
                      plan.popular
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/50"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {plan.cta}
                  </button>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground/30 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included
                              ? "text-foreground"
                              : "text-muted-foreground/50"
                          }`}
                        >
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Comparison */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose BizTrackr?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built specifically for Pakistani businesses. Simple, powerful, and
              affordable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Easy to Use",
                description:
                  "No training needed. Start in 5 minutes. Your staff will love it.",
              },
              {
                icon: Package,
                title: "Complete Solution",
                description:
                  "Sales, inventory, expenses, employees - everything in one place.",
              },
              {
                icon: BarChart3,
                title: "AI-Powered Insights",
                description:
                  "Get business advice from AI. Know when to hire, expand, or optimize.",
              },
              {
                icon: FileText,
                title: "Professional Invoices",
                description:
                  "Create beautiful invoices in seconds. Impress your customers.",
              },
              {
                icon: Shield,
                title: "Secure & Reliable",
                description:
                  "Your data is safe. Daily backups. 99.9% uptime guarantee.",
              },
              {
                icon: Headphones,
                title: "Local Support",
                description:
                  "Urdu/English support. We understand Pakistani business needs.",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-xl border border-border/40 bg-card hover:shadow-lg transition-all duration-300"
                >
                  <div className="inline-flex p-3 rounded-lg bg-orange-500/10 mb-4">
                    <Icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-secondary/30">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Compare Plans
            </h2>
            <p className="text-muted-foreground">
              See what's included in each plan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-foreground font-semibold">
                    Feature
                  </th>
                  {plans.map((plan, idx) => (
                    <th
                      key={idx}
                      className="text-center py-4 px-4 text-foreground font-semibold"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  "Customers",
                  "Products",
                  "Invoices",
                  "Dashboard",
                  "Mobile Access",
                  "AI Insights",
                  "Voice Input",
                  "Multi-user",
                  "Priority Support",
                ].map((feature, idx) => (
                  <tr key={idx} className="border-b border-border/40">
                    <td className="py-4 px-4 text-muted-foreground">
                      {feature}
                    </td>
                    {plans.map((plan, planIdx) => (
                      <td key={planIdx} className="text-center py-4 px-4">
                        {plan.features.find((f) => f.text.includes(feature))
                          ?.included ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "Can I start with Free and upgrade later?",
                a: "Yes! Start free, test everything. Upgrade anytime. Your data stays safe.",
              },
              {
                q: "What payment methods do you accept?",
                a: "JazzCash, EasyPaisa, Bank Transfer, and Credit/Debit Cards.",
              },
              {
                q: "Is there a setup fee?",
                a: "No! No setup fee, no hidden charges. Just the monthly price.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. Cancel anytime. No questions asked. No penalties.",
              },
              {
                q: "Do you provide training?",
                a: "The app is so easy, you won't need training. But yes, we provide free video tutorials and support.",
              },
              {
                q: "Is my data safe?",
                a: "100% safe. Daily backups. Secure servers. Your data is encrypted.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl border border-border/40 bg-card"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {faq.q}
                </h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-purple-600 p-12 text-center">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="relative space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Ready to Grow Your Business?
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Join thousands of Pakistani businesses using BizTrackr. Start
                free today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button className="px-8 py-4 bg-white text-orange-600 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Start Free Trial
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300">
                  Schedule Demo
                </button>
              </div>
              <p className="text-sm text-white/80">
                No credit card required • Cancel anytime • 24/7 support
              </p>
            </div>
          </div>
        </div>
      </main>

      <AIChatbot />
    </div>
  );
}
