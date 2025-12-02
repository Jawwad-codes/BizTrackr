/** @format */

"use client";

import { Sidebar } from "@/components/sidebar";
import { AIChatbot } from "@/components/ai-chatbot";
import { ExcelExport } from "@/components/excel-export";
import { useRequireAuth } from "@/lib/auth-context";
import { LoadingSpinner } from "@/components/loading-states";
import {
  FileSpreadsheet,
  Download,
  TrendingUp,
  Package,
  Users,
  CreditCard,
} from "lucide-react";

export default function ExportPage() {
  const { user, loading: authLoading } = useRequireAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner message="Loading..." size="lg" />
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
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Export Data
                </h1>
                <p className="text-muted-foreground">
                  Download your business data in Excel or CSV format
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-6 rounded-xl border border-border/40 bg-card">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-foreground">Sales Data</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                All transactions with totals
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/40 bg-card">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-foreground">Expenses</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Category breakdown included
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/40 bg-card">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-foreground">Inventory</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Stock levels & valuations
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/40 bg-card">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-foreground">Employees</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Team info & payroll
              </p>
            </div>
          </div>

          {/* Export Component */}
          <div className="p-8 rounded-xl border border-border/40 bg-card">
            <div className="flex items-center gap-3 mb-6">
              <FileSpreadsheet className="w-6 h-6 text-green-500" />
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Export Options
                </h2>
                <p className="text-sm text-muted-foreground">
                  Choose what to export and in which format
                </p>
              </div>
            </div>

            <ExcelExport />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-border/40 bg-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                What's Included
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>All your business data with proper formatting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Automatic calculations and totals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Professional Excel formatting with charts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>CSV format for universal compatibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Date range filtering options</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-xl border border-border/40 bg-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Export Tips
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">💡</span>
                  <span>
                    Use <strong>Complete Report</strong> for comprehensive
                    analysis
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">💡</span>
                  <span>
                    Export <strong>Sales</strong> for revenue tracking
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">💡</span>
                  <span>
                    Use <strong>Expenses</strong> for tax preparation
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">💡</span>
                  <span>
                    <strong>Excel format</strong> includes charts and summaries
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">💡</span>
                  <span>
                    <strong>CSV format</strong> works with any spreadsheet app
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <AIChatbot />
    </div>
  );
}
