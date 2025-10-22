/** @format */

"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExcelExport } from "@/components/excel-export";
import { FileSpreadsheet, Download, BarChart3, TrendingUp } from "lucide-react";

export default function ExportPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Data Export</h1>
        <p className="text-muted-foreground">
          Export your business data in professional formats with real values and
          proper formatting
        </p>
      </div>

      {/* Export Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excel Export</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Professional</div>
            <p className="text-xs text-muted-foreground">
              Formatted spreadsheets with charts and summaries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Real Data</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Live Values</div>
            <p className="text-xs text-muted-foreground">
              Current data from your database, not hardcoded values
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Multiple Formats
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">XLSX & CSV</div>
            <p className="text-xs text-muted-foreground">
              Choose the format that works best for you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Insights</div>
            <p className="text-xs text-muted-foreground">
              Automatic calculations and business metrics
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Export Component */}
      <ExcelExport />

      {/* Export Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>What's Included in Your Export</CardTitle>
            <CardDescription>
              Each export type includes comprehensive data and analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Complete Business Report</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Dashboard with key metrics and KPIs</li>
                <li>• Sales data with totals and trends</li>
                <li>• Expense breakdown by category</li>
                <li>• Employee information and payroll</li>
                <li>• Inventory status and valuations</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Sales Report</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Individual sales transactions</li>
                <li>• Revenue totals and averages</li>
                <li>• Product performance analysis</li>
                <li>• Time-based sales trends</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Expenses Report</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Expense transactions by category</li>
                <li>• Monthly and yearly breakdowns</li>
                <li>• Category-wise spending analysis</li>
                <li>• Percentage distributions</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Features</CardTitle>
            <CardDescription>
              Professional formatting and advanced features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Professional Formatting</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Currency values properly formatted</li>
                <li>• Date formatting for readability</li>
                <li>• Automatic column sizing</li>
                <li>• Header styling and organization</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Automatic Calculations</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Totals and subtotals</li>
                <li>• Profit margins and percentages</li>
                <li>• Category breakdowns</li>
                <li>• Inventory valuations</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Data Filtering</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Date range filtering</li>
                <li>• Category-specific exports</li>
                <li>• Custom field selection</li>
                <li>• Metadata inclusion options</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Best Results</CardTitle>
          <CardDescription>
            Get the most out of your data exports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">For Financial Analysis</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use date ranges for specific periods</li>
                <li>• Export complete reports for comprehensive analysis</li>
                <li>• Include metadata for context and calculations</li>
                <li>• Use Excel format for advanced features</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">For External Sharing</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• CSV format for universal compatibility</li>
                <li>• Specific report types for focused data</li>
                <li>• Consider date ranges for relevant periods</li>
                <li>• Professional formatting for presentations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
