/** @format */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Download, FileSpreadsheet, Calendar, Settings } from "lucide-react";

interface ExcelExportProps {
  className?: string;
}

export function ExcelExport({ className }: ExcelExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState("all");
  const [format, setFormat] = useState("xlsx");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const { toast } = useToast();

  const exportOptions = [
    {
      value: "all",
      label: "Complete Business Report",
      description: "All data with dashboard summary",
    },
    {
      value: "sales",
      label: "Sales Report",
      description: "Sales transactions and analytics",
    },
    {
      value: "expenses",
      label: "Expenses Report",
      description: "Expense tracking and categories",
    },
    {
      value: "employees",
      label: "Employees Report",
      description: "Staff information and payroll",
    },
    {
      value: "inventory",
      label: "Inventory Report",
      description: "Stock levels and product details",
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        type: exportType,
        format: format,
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      // Make API request
      const response = await fetch(`/api/export/excel?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Export failed");
      }

      // Get the filename from response headers
      const contentDisposition = response.headers.get("content-disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : `business-export-${exportType}-${
            new Date().toISOString().split("T")[0]
          }.xlsx`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: `Your ${
          exportOptions.find((opt) => opt.value === exportType)?.label
        } has been downloaded.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description:
          error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleAdvancedExport = async () => {
    setIsExporting(true);

    try {
      const exportData = {
        exportType,
        format,
        dateRange:
          startDate && endDate ? { start: startDate, end: endDate } : undefined,
        includeMetadata,
      };

      const response = await fetch("/api/export/excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Export failed");
      }

      // Get the filename from response headers
      const contentDisposition = response.headers.get("content-disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : `business-export-${exportType}-${
            new Date().toISOString().split("T")[0]
          }.xlsx`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: `Your ${
          exportOptions.find((opt) => opt.value === exportType)?.label
        } has been downloaded.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description:
          error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Excel Export
        </CardTitle>
        <CardDescription>
          Export your business data to Excel with professional formatting and
          real values
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="export-type">Export Type</Label>
          <Select value={exportType} onValueChange={setExportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select what to export" />
            </SelectTrigger>
            <SelectContent>
              {exportOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {option.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range Filter (Optional)
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-sm">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-sm">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <Label htmlFor="format">File Format</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xlsx">Excel (.xlsx) - Recommended</SelectItem>
              <SelectItem value="csv">CSV (.csv) - Simple format</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Options */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Advanced Options
          </Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-metadata"
              checked={includeMetadata}
              onCheckedChange={(checked) =>
                setIncludeMetadata(checked as boolean)
              }
            />
            <Label htmlFor="include-metadata" className="text-sm">
              Include metadata and summary statistics
            </Label>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Quick Export"}
          </Button>
          <Button
            onClick={handleAdvancedExport}
            disabled={isExporting}
            variant="outline"
            className="flex-1"
          >
            <Settings className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Advanced Export"}
          </Button>
        </div>

        {/* Export Info */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            • Excel files include professional formatting, charts, and summaries
          </p>
          <p>• All monetary values are properly formatted as currency</p>
          <p>• Date ranges apply to sales and expenses data only</p>
          <p>• Complete reports include a dashboard summary sheet</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ExcelExport;
