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
  AlertCircle,
  Lightbulb,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface InsightMetrics {
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: string;
  lowStockCount: number;
  employeeCount: number;
}

interface InsightData {
  insights: string;
  metrics: InsightMetrics;
}

export default function InsightsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const { loading, error, withLoading, clearError } = useLoading();

  const generateInsights = async () => {
    const result = await withLoading(async () => {
      // Get user token from localStorage
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

      if (result.success) {
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

  const formatInsights = (insights: string) => {
    // Split insights into sections for better formatting
    const sections = insights.split(/\d+\.\s+/).filter(Boolean);
    return sections;
  };

  // Don't render anything while checking authentication
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner message="Authenticating..." size="lg" />
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-background min-h-screen">
        <div className="max-w-4xl mx-auto space-y-8">
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
              Get AI-powered analysis of your business performance, trends, and
              actionable recommendations to grow your business.
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
                  Analyzing Your Business...
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
              <CardSkeleton className="h-64" />
            </div>
          )}

          {/* Insights Display */}
          {insightData && !loading && (
            <div className="space-y-6 animate-slide-up">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 border border-border/40 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold text-foreground">
                      Net Profit
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    ${insightData.metrics.netProfit.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {insightData.metrics.profitMargin}% margin
                  </p>
                </div>

                <div className="p-6 border border-border/40 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-foreground">
                      Low Stock Items
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {insightData.metrics.lowStockCount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Need attention
                  </p>
                </div>

                <div className="p-6 border border-border/40 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Lightbulb className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold text-foreground">Team Size</h3>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {insightData.metrics.employeeCount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Active employees
                  </p>
                </div>
              </div>

              {/* AI Insights */}
              <div className="p-8 border border-orange-200 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="w-6 h-6 text-orange-500" />
                  <h2 className="text-xl font-bold text-foreground">
                    AI Analysis & Recommendations
                  </h2>
                </div>

                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <div className="whitespace-pre-line text-foreground leading-relaxed">
                    {insightData.insights}
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="p-6 border border-border/40 bg-card/50 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Quick Actions
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button className="p-3 text-left border border-border/40 hover:bg-secondary/50 rounded-lg transition-colors">
                    <p className="font-medium text-foreground">
                      Review Inventory
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Check low stock items
                    </p>
                  </button>
                  <button className="p-3 text-left border border-border/40 hover:bg-secondary/50 rounded-lg transition-colors">
                    <p className="font-medium text-foreground">
                      Analyze Expenses
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Optimize spending
                    </p>
                  </button>
                  <button className="p-3 text-left border border-border/40 hover:bg-secondary/50 rounded-lg transition-colors">
                    <p className="font-medium text-foreground">
                      Sales Strategy
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Boost revenue
                    </p>
                  </button>
                  <button className="p-3 text-left border border-border/40 hover:bg-secondary/50 rounded-lg transition-colors">
                    <p className="font-medium text-foreground">
                      Team Management
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Employee insights
                    </p>
                  </button>
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
                Click the button above to generate AI-powered insights based on
                your sales, expenses, inventory, and employee data.
              </p>
            </div>
          )}
        </div>
      </main>

      <AIChatbot />
    </div>
  );
}
