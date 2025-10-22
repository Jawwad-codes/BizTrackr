/** @format */

"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { AIChatbot } from "@/components/ai-chatbot";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Calendar,
  Download,
  Package,
  AlertTriangle,
} from "lucide-react";
import { DashboardMetrics, APIResponse } from "@/lib/models/types";
import { useRequireAuth } from "@/lib/auth-context";
import { APIError } from "@/components/api-error-handler";
import {
  LoadingSpinner,
  CardSkeleton,
  ChartSkeleton,
} from "@/components/loading-states";
import { useLoading } from "@/hooks/use-loading";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "oklch(0.65 0.25 45)",
  "oklch(0.55 0.2 200)",
  "oklch(0.45 0.15 280)",
  "oklch(0.75 0.2 120)",
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [timeRange, setTimeRange] = useState("6m");
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(
    null
  );

  const { loading, error, withLoading, clearError } = useLoading({
    initialLoading: true,
  });
  const { toast } = useToast();

  // Fetch dashboard data on component mount and when time range changes
  useEffect(() => {
    // Only fetch data if user is authenticated
    if (user && !authLoading) {
      fetchDashboardData();
    }
  }, [timeRange, user, authLoading]);

  const fetchDashboardData = async () => {
    const result = await withLoading(async () => {
      // Get user token from localStorage
      const userData = localStorage.getItem("user");
      const token = userData ? JSON.parse(userData).token : null;

      // Calculate date range based on selection
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = getStartDate(timeRange);

      const response = await fetch(
        `/api/dashboard/metrics?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result: APIResponse<DashboardMetrics> = await response.json();

      if (result.success) {
        setDashboardData(result.data);
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    });

    if (result) {
      toast({
        title: "Dashboard updated",
        description: `Loaded data for ${timeRange} period`,
      });
    }
  };

  const getStartDate = (range: string): string => {
    const now = new Date();
    switch (range) {
      case "1m":
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          .toISOString()
          .split("T")[0];
      case "3m":
        return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
          .toISOString()
          .split("T")[0];
      case "6m":
        return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
          .toISOString()
          .split("T")[0];
      case "1y":
        return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          .toISOString()
          .split("T")[0];
      default:
        return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
          .toISOString()
          .split("T")[0];
    }
  };

  const handleExport = () => {
    if (!dashboardData) return;

    const reportData = {
      timeRange,
      generatedAt: new Date().toLocaleDateString(),
      metrics: {
        totalSales: `$${dashboardData.totalSales.toLocaleString()}`,
        totalExpenses: `$${dashboardData.totalExpenses.toLocaleString()}`,
        netProfit: `$${dashboardData.netProfit.toLocaleString()}`,
        profitMargin: `${dashboardData.profitMargin}%`,
      },
      chartData: dashboardData.chartData,
      categoryData: dashboardData.categoryData,
    };

    const csvContent = [
      ["BizTrackr AI - Business Report"],
      [`Generated: ${reportData.generatedAt}`],
      [`Time Range: ${timeRange}`],
      [],
      ["Metrics"],
      ["Total Sales", reportData.metrics.totalSales],
      ["Total Expenses", reportData.metrics.totalExpenses],
      ["Net Profit", reportData.metrics.netProfit],
      ["Profit Margin", reportData.metrics.profitMargin],
      [],
      ["Daily Data"],
      ["Date", "Sales", "Expenses", "Profit"],
      ...reportData.chartData.map((row) => [
        row.date,
        row.sales,
        row.expenses,
        row.profit,
      ]),
      [],
      ["Category Breakdown"],
      ["Category", "Amount", "Percentage"],
      ...reportData.categoryData.map((row) => [
        row.category,
        row.amount,
        `${row.percentage.toFixed(1)}%`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `biztrackr-report-${timeRange}-${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header with Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Dashboard
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Welcome back! Here's your business overview.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-secondary border border-border/40 text-foreground text-sm transition-all duration-300 ease-out disabled:opacity-50"
              >
                <option value="1m">Last Month</option>
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
              <button
                onClick={() => (window.location.href = "/export")}
                disabled={loading || !dashboardData}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground border border-border/40 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          <APIError
            error={error}
            onRetry={fetchDashboardData}
            onDismiss={clearError}
          />

          {/* Low Stock Alert */}
          {dashboardData && dashboardData.lowStockItems > 0 && (
            <div className="p-4 border border-gray-200 bg-gray-50 text-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <p className="font-semibold">Low Stock Alert</p>
              </div>
              <p className="text-sm">
                You have {dashboardData.lowStockItems} item
                {dashboardData.lowStockItems > 1 ? "s" : ""} running low on
                stock.{" "}
                <a href="/inventory" className="underline hover:no-underline">
                  Check inventory →
                </a>
              </p>
            </div>
          )}

          {/* Key Metrics Grid - Mobile Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            ) : dashboardData ? (
              [
                {
                  label: "Total Sales",
                  value: `$${dashboardData.totalSales.toLocaleString()}`,
                  change: "+12%", // TODO: Calculate actual change
                  icon: TrendingUp,
                  color: "text-green-500",
                  bgColor: "from-green-500/10 to-green-500/5",
                },
                {
                  label: "Total Expenses",
                  value: `$${dashboardData.totalExpenses.toLocaleString()}`,
                  change: "-5%", // TODO: Calculate actual change
                  icon: TrendingDown,
                  color: "text-red-500",
                  bgColor: "from-red-500/10 to-red-500/5",
                },
                {
                  label: "Net Profit",
                  value: `$${dashboardData.netProfit.toLocaleString()}`,
                  change: "+18%", // TODO: Calculate actual change
                  icon: DollarSign,
                  color:
                    dashboardData.netProfit >= 0
                      ? "text-accent"
                      : "text-red-500",
                  bgColor:
                    dashboardData.netProfit >= 0
                      ? "from-accent/10 to-accent/5"
                      : "from-red-500/10 to-red-500/5",
                },
                {
                  label: "Profit Margin",
                  value: `${dashboardData.profitMargin.toFixed(1)}%`,
                  change: "+2.3%", // TODO: Calculate actual change
                  icon: Zap,
                  color: "text-blue-500",
                  bgColor: "from-blue-500/10 to-blue-500/5",
                },
                {
                  label: "Inventory Value",
                  value: `$${dashboardData.totalInventoryValue.toLocaleString()}`,
                  change: `${dashboardData.totalProducts} items`,
                  icon: Package,
                  color: "text-purple-500",
                  bgColor: "from-purple-500/10 to-purple-500/5",
                },
                {
                  label: "Low Stock Items",
                  value: dashboardData.lowStockItems.toString(),
                  change:
                    dashboardData.lowStockItems > 0
                      ? "Needs attention"
                      : "All good",
                  icon: AlertTriangle,
                  color:
                    dashboardData.lowStockItems > 0
                      ? "text-gray-500"
                      : "text-green-500",
                  bgColor:
                    dashboardData.lowStockItems > 0
                      ? "from-gray-500/10 to-gray-500/5"
                      : "from-green-500/10 to-green-500/5",
                },
              ].map((metric, i) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={i}
                    className={`p-6 border border-border/40 bg-gradient-to-br ${metric.bgColor} backdrop-blur hover:border-accent/50 transition-all hover:shadow-lg animate-slide-up rounded-lg`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                          {metric.label}
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-foreground">
                          {metric.value}
                        </p>
                        <p className={`text-xs font-semibold ${metric.color}`}>
                          {metric.change} from last period
                        </p>
                      </div>
                      <Icon
                        className={`w-6 sm:w-8 h-6 sm:h-8 ${metric.color} opacity-80`}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full p-6 border border-red-200 bg-red-50 text-red-700 rounded-lg text-center">
                <p>No data available</p>
              </div>
            )}
          </div>

          {/* Charts Section - Mobile Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales vs Expenses Trend */}
            <div className="lg:col-span-2 p-6 border border-border/40 bg-card/50 backdrop-blur rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">
                  Revenue Trend
                </h3>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <LoadingSpinner message="Loading chart data..." />
                </div>
              ) : dashboardData && dashboardData.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      className="stroke-muted-foreground/30"
                    />
                    <XAxis
                      stroke="currentColor"
                      className="fill-foreground"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke="currentColor"
                      className="fill-foreground"
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#f97316"
                      strokeWidth={3}
                      dot={false}
                      name="Sales"
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="currentColor"
                      strokeWidth={3}
                      dot={false}
                      name="Expenses"
                      className="stroke-foreground"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <p>No chart data available</p>
                </div>
              )}
            </div>

            {/* Expense Breakdown */}
            <div className="p-6 border border-border/40 bg-card/50 backdrop-blur rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-6">
                Expense Breakdown
              </h3>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <LoadingSpinner message="Loading expense data..." />
                </div>
              ) : dashboardData && dashboardData.categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.categoryData.map((cat) => ({
                        name: cat.category,
                        value: cat.amount,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dashboardData.categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <p>No expense data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Profit Analysis */}
          <div className="p-6 border border-border/40 bg-card/50 backdrop-blur rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-6">
              Profit Analysis
            </h3>
            {loading ? (
              <div className="h-[250px] flex items-center justify-center">
                <LoadingSpinner message="Loading profit analysis..." />
              </div>
            ) : dashboardData && dashboardData.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dashboardData.chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    className="stroke-muted-foreground/30"
                  />
                  <XAxis
                    stroke="currentColor"
                    className="fill-foreground"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="currentColor"
                    className="fill-foreground"
                    style={{ fontSize: "12px" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="profit" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <p>No profit data available</p>
              </div>
            )}
          </div>

          {/* AI Insights Card */}
          <div className="p-6 border border-orange-500/50 bg-gradient-to-br from-orange-500/15 to-orange-500/5 backdrop-blur rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  AI-Powered Insights
                </h3>
                <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  {dashboardData ? (
                    <>
                      <p>
                        <span className="text-accent font-semibold">
                          Revenue Analysis:
                        </span>{" "}
                        Your total sales are $
                        {dashboardData.totalSales.toLocaleString()} with a
                        profit margin of {dashboardData.profitMargin.toFixed(1)}
                        %.
                      </p>
                      <p>
                        <span className="text-accent font-semibold">
                          Cost Analysis:
                        </span>{" "}
                        Total expenses are $
                        {dashboardData.totalExpenses.toLocaleString()},
                        resulting in a net profit of $
                        {dashboardData.netProfit.toLocaleString()}.
                      </p>
                      <p>
                        <span className="text-accent font-semibold">
                          Recommendation:
                        </span>{" "}
                        {dashboardData.netProfit >= 0
                          ? "Continue current strategies to maintain profitability."
                          : "Consider cost optimization to improve profit margins."}
                      </p>
                    </>
                  ) : (
                    <p>Loading insights...</p>
                  )}
                </div>
                <div className="mt-4">
                  <a
                    href="/insights"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                  >
                    <Zap className="w-4 h-4" />
                    Get Full AI Analysis
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-6 border border-border/40 bg-card/50 backdrop-blur rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
              Recent Activity
            </h3>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg animate-pulse"
                  >
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : dashboardData && dashboardData.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentActivity.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.date}
                      </p>
                    </div>
                    <p
                      className={`text-xs sm:text-sm font-semibold whitespace-nowrap ml-2 ${
                        activity.type === "sale"
                          ? "text-green-500"
                          : activity.type === "expense"
                          ? "text-red-500"
                          : "text-accent"
                      }`}
                    >
                      {activity.amount
                        ? `$${activity.amount.toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <AIChatbot />
    </div>
  );
}
