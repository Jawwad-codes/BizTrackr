/** @format */

"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { AIChatbot } from "@/components/ai-chatbot";
import { useRequireAuth } from "@/lib/auth-context";
import { LoadingSpinner, CardSkeleton } from "@/components/loading-states";
import { useLoading } from "@/hooks/use-loading";
import { toast } from "sonner";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Package,
  DollarSign,
  Users,
  Activity,
  FileText,
  Target,
  Calendar,
  Zap,
  BarChart3,
  ShoppingCart,
  CreditCard,
  Briefcase,
} from "lucide-react";

interface InsightMetrics {
  totalSales: number;
  totalExpenses: number; // Business expenses only
  totalSalaries: number; // Employee salaries
  totalExpensesWithSalaries: number; // Total of both
  netProfit: number; // Sales - (Expenses + Salaries)
  profitMargin: string;
  lowStockCount: number;
  outOfStockCount: number;
  employeeCount: number;
  salesGrowth: string;
  totalInventoryValue: number;
  totalInventoryCost: number;
  healthStatus: string;
  isHealthy: boolean;
  hasWarnings: boolean;
  isCritical: boolean;
}

interface StockAlert {
  name: string;
  current: number;
  minimum: number;
}

interface InsightData {
  insights: string;
  metrics: InsightMetrics;
  alerts: {
    lowStock: StockAlert[];
    outOfStock: { name: string }[];
  };
}

export default function InsightsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const { loading, error, withLoading, clearError } = useLoading();

  const generateInsights = async () => {
    const result = await withLoading(async () => {
      const userData = localStorage.getItem("user");
      const token = userData ? JSON.parse(userData).token : null;

      const response = await fetch("/api/insights", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      console.log("📥 Received insights data:", result);

      if (result.success) {
        console.log("✅ Insights metrics:", result.data.metrics);
        console.log("📦 Alerts:", result.data.alerts);
        setInsightData(result.data);
        setLastGenerated(new Date());
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    });

    if (result) {
      toast.success("AI insights generated successfully!");
    }
  };

  const getHealthIcon = (status: string) => {
    if (status.includes("CRITICAL"))
      return <AlertCircle className="w-6 h-6 text-red-500" />;
    if (status.includes("ATTENTION"))
      return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    if (status.includes("HEALTHY"))
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    return <Activity className="w-6 h-6 text-blue-500" />;
  };

  const getHealthColor = (status: string) => {
    if (status.includes("CRITICAL")) return "border-red-500 bg-red-500/10";
    if (status.includes("ATTENTION"))
      return "border-yellow-500 bg-yellow-500/10";
    if (status.includes("HEALTHY")) return "border-green-500 bg-green-500/10";
    return "border-blue-500 bg-blue-500/10";
  };

  const parseInsights = (insights: string) => {
    const sections = insights.split(/SECTION \d+:/);
    const parsed: { [key: string]: string } = {};

    sections.forEach((section) => {
      const lines = section.trim().split("\n");
      const title = lines[0]?.trim();
      const content = lines.slice(1).join("\n").trim();
      if (title) {
        parsed[title] = content;
      }
    });

    return parsed;
  };

  const getSectionIcon = (title: string) => {
    if (title.includes("EXECUTIVE"))
      return <FileText className="w-5 h-5 text-blue-500" />;
    if (title.includes("ALERT"))
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (title.includes("FINANCIAL"))
      return <DollarSign className="w-5 h-5 text-green-500" />;
    if (title.includes("OPERATIONAL"))
      return <BarChart3 className="w-5 h-5 text-purple-500" />;
    if (title.includes("STRATEGIC") || title.includes("GROWTH"))
      return <Target className="w-5 h-5 text-orange-500" />;
    if (title.includes("RECOMMENDATION"))
      return <Lightbulb className="w-5 h-5 text-yellow-500" />;
    if (title.includes("ACTION PLAN"))
      return <Calendar className="w-5 h-5 text-indigo-500" />;
    return <Sparkles className="w-5 h-5 text-pink-500" />;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner message="Authenticating..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-background min-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Brain className="w-8 h-8 text-orange-500" />
              <h1 className="text-3xl font-bold text-foreground">
                AI Business Insights
              </h1>
              <Sparkles className="w-6 h-6 text-orange-500" />
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get comprehensive AI-powered analysis of your complete business
              data with health alerts and actionable improvement strategies.
            </p>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={generateInsights}
              disabled={loading}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold flex items-center gap-3 mx-auto transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyzing Your Complete Business Data...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Generate AI Insights
                </>
              )}
            </button>
            {lastGenerated && (
              <p className="text-sm text-muted-foreground mt-2">
                Last generated: {lastGenerated.toLocaleString()}
              </p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-semibold">Failed to generate insights</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={clearError}
                  className="text-sm underline hover:no-underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
              <CardSkeleton className="h-64" />
            </div>
          )}

          {/* Insights Display */}
          {insightData && !loading && (
            <div className="space-y-6 animate-slide-up">
              {/* Business Health Status Banner */}
              <div
                className={`p-6 border-2 rounded-lg ${getHealthColor(
                  insightData.metrics.healthStatus
                )}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getHealthIcon(insightData.metrics.healthStatus)}
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        Business Health: {insightData.metrics.healthStatus}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {insightData.metrics.isCritical &&
                          "Immediate action required to address critical issues"}
                        {insightData.metrics.hasWarnings &&
                          !insightData.metrics.isCritical &&
                          "Some areas need attention"}
                        {insightData.metrics.isHealthy &&
                          "Your business is performing well"}
                        {!insightData.metrics.isCritical &&
                          !insightData.metrics.hasWarnings &&
                          !insightData.metrics.isHealthy &&
                          "Business is stable"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">
                      {insightData.metrics.profitMargin}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Profit Margin
                    </p>
                  </div>
                </div>
              </div>

              {/* Critical Alerts */}
              {(insightData.alerts.outOfStock.length > 0 ||
                insightData.alerts.lowStock.length > 0) && (
                <div className="space-y-4">
                  {insightData.alerts.outOfStock.length > 0 && (
                    <div className="p-4 border-2 border-red-500 bg-red-500/10 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <h3 className="font-bold text-foreground">
                          🚨 OUT OF STOCK (
                          {insightData.alerts.outOfStock.length} items)
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {insightData.alerts.outOfStock.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-background/50 rounded text-sm"
                          >
                            • {item.name} -{" "}
                            <span className="text-red-500 font-semibold">
                              URGENT RESTOCK!
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {insightData.alerts.lowStock.length > 0 && (
                    <div className="p-4 border-2 border-yellow-500 bg-yellow-500/10 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-bold text-foreground">
                          ⚠️ LOW STOCK ({insightData.alerts.lowStock.length}{" "}
                          items)
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {insightData.alerts.lowStock.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-background/50 rounded text-sm"
                          >
                            • {item.name}:{" "}
                            <span className="text-yellow-600 font-semibold">
                              {item.current}
                            </span>{" "}
                            units (Min: {item.minimum})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 border border-border/40 bg-card rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold text-foreground">
                      Net Profit
                    </h3>
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      (insightData.metrics.netProfit || 0) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    $
                    {Math.abs(
                      insightData.metrics.netProfit || 0
                    ).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(insightData.metrics.netProfit || 0) >= 0
                      ? "Profit"
                      : "Loss"}
                  </p>
                </div>

                <div className="p-6 border border-border/40 bg-card rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    {parseFloat(insightData.metrics.salesGrowth || "0") >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                    <h3 className="font-semibold text-foreground">
                      Sales Growth
                    </h3>
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      parseFloat(insightData.metrics.salesGrowth || "0") >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {parseFloat(insightData.metrics.salesGrowth || "0") >= 0
                      ? "+"
                      : ""}
                    {insightData.metrics.salesGrowth || "0"}%
                  </p>
                  <p className="text-sm text-muted-foreground">30-day trend</p>
                </div>

                <div className="p-6 border border-border/40 bg-card rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-foreground">Inventory</h3>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    $
                    {(
                      insightData.metrics.totalInventoryValue || 0
                    ).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(insightData.metrics.lowStockCount || 0) +
                      (insightData.metrics.outOfStockCount || 0) >
                    0
                      ? `${
                          (insightData.metrics.lowStockCount || 0) +
                          (insightData.metrics.outOfStockCount || 0)
                        } alerts`
                      : "All stocked"}
                  </p>
                </div>

                <div className="p-6 border border-border/40 bg-card rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold text-foreground">Team</h3>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {insightData.metrics.employeeCount || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${(insightData.metrics.totalSalaries || 0).toLocaleString()}
                    /mo
                  </p>
                </div>
              </div>

              {/* AI Insights - Enhanced with Icons */}
              <div className="space-y-6">
                {/* Report Header */}
                <div className="p-8 border-2 border-orange-500 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-orange-500">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        Business Analysis Report
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Prepared by BizBot AI Business Consultant •{" "}
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Parse and Display Sections */}
                {(() => {
                  const sections = parseInsights(insightData.insights);
                  return Object.entries(sections).map(
                    ([title, content], idx) => {
                      if (
                        !title ||
                        title.includes("═") ||
                        title.includes("BUSINESS ANALYSIS") ||
                        title.includes("END OF REPORT")
                      )
                        return null;

                      const isAlert = title.includes("ALERT");
                      const isAction = title.includes("ACTION PLAN");

                      return (
                        <div
                          key={idx}
                          className={`p-6 rounded-xl border ${
                            isAlert
                              ? "border-red-500/50 bg-red-500/5"
                              : isAction
                              ? "border-indigo-500/50 bg-indigo-500/5"
                              : "border-border/40 bg-card"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            {getSectionIcon(title)}
                            <h3 className="text-lg font-bold text-foreground">
                              {title}
                            </h3>
                          </div>
                          <div className="whitespace-pre-line text-foreground leading-relaxed text-sm">
                            {content}
                          </div>
                        </div>
                      );
                    }
                  );
                })()}
              </div>

              {/* Quick Actions */}
              <div className="p-6 border border-border/40 bg-card rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Quick Actions
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <a
                    href="/inventory"
                    className="p-3 text-left border border-border/40 hover:bg-secondary/50 rounded-lg transition-colors"
                  >
                    <p className="font-medium text-foreground">
                      Review Inventory
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(insightData.metrics.lowStockCount || 0) +
                        (insightData.metrics.outOfStockCount || 0) >
                      0
                        ? `${
                            (insightData.metrics.lowStockCount || 0) +
                            (insightData.metrics.outOfStockCount || 0)
                          } items need attention`
                        : "Check stock levels"}
                    </p>
                  </a>
                  <a
                    href="/expenses"
                    className="p-3 text-left border border-border/40 hover:bg-secondary/50 rounded-lg transition-colors"
                  >
                    <p className="font-medium text-foreground">
                      Analyze Expenses
                    </p>
                    <p className="text-sm text-muted-foreground">
                      $
                      {(
                        insightData.metrics.totalExpensesWithSalaries || 0
                      ).toLocaleString()}{" "}
                      total (incl. salaries)
                    </p>
                  </a>
                  <a
                    href="/sales"
                    className="p-3 text-left border border-border/40 hover:bg-secondary/50 rounded-lg transition-colors"
                  >
                    <p className="font-medium text-foreground">
                      Sales Strategy
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${(insightData.metrics.totalSales || 0).toLocaleString()}{" "}
                      revenue
                    </p>
                  </a>
                  <a
                    href="/employees"
                    className="p-3 text-left border border-border/40 hover:bg-secondary/50 rounded-lg transition-colors"
                  >
                    <p className="font-medium text-foreground">
                      Team Management
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {insightData.metrics.employeeCount || 0} employees
                    </p>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!insightData && !loading && (
            <div className="text-center py-16">
              <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Ready to Analyze Your Business?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Click the button above to generate comprehensive AI-powered
                insights based on ALL your sales, expenses, inventory, and
                employee data with health alerts and improvement strategies.
              </p>
            </div>
          )}
        </div>
      </main>

      <AIChatbot />
    </div>
  );
}
