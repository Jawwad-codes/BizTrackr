/** @format */

"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ChartDataPoint {
  date: string;
  sales: number;
  expenses: number;
  profit: number;
}

interface TradingChartProps {
  data: ChartDataPoint[];
  height?: number;
  showProfit?: boolean;
  type?: "line" | "area";
}

export function TradingChart({
  data,
  height = 300,
  showProfit = true,
  type = "line",
}: TradingChartProps) {
  // Format data for better display
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  // Calculate trend
  const latestProfit = data[data.length - 1]?.profit || 0;
  const previousProfit = data[data.length - 2]?.profit || 0;
  const profitChange = latestProfit - previousProfit;
  const isPositiveTrend = profitChange >= 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-green-600">Sales:</span>
              <span className="font-medium">
                ${data.sales.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-red-600">Expenses:</span>
              <span className="font-medium">
                ${data.expenses.toLocaleString()}
              </span>
            </div>
            {showProfit && (
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
                <span className="text-blue-600">Profit:</span>
                <span
                  className={`font-bold ${
                    data.profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${data.profit.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Trend indicator */}
      {showProfit && (
        <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Latest Profit</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-bold ${
                isPositiveTrend ? "text-green-600" : "text-red-600"
              }`}
            >
              ${latestProfit.toLocaleString()}
            </span>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                isPositiveTrend
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {isPositiveTrend ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              ${Math.abs(profitChange).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        {type === "area" ? (
          <ComposedChart
            data={formattedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositiveTrend ? "#10b981" : "#ef4444"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isPositiveTrend ? "#10b981" : "#ef4444"}
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>

            {/* Grid with trading-style appearance */}
            <CartesianGrid
              strokeDasharray="1 1"
              stroke="currentColor"
              className="stroke-muted-foreground/15"
              horizontal={true}
              vertical={false}
            />

            {/* X-axis */}
            <XAxis
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="fill-muted-foreground"
            />

            {/* Y-axis with trading-style formatting */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="fill-muted-foreground"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Zero line reference */}
            <ReferenceLine
              y={0}
              stroke="currentColor"
              className="stroke-muted-foreground/30"
              strokeWidth={1}
            />

            {/* Profit area with gradient */}
            {showProfit && (
              <Area
                type="monotone"
                dataKey="profit"
                stroke={isPositiveTrend ? "#10b981" : "#ef4444"}
                strokeWidth={2}
                fill="url(#profitGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  stroke: isPositiveTrend ? "#10b981" : "#ef4444",
                  strokeWidth: 2,
                  fill: "white",
                }}
              />
            )}

            {/* Sales line - green dashed */}
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#10b981"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="3 3"
              opacity={0.7}
            />

            {/* Expenses line - red dashed */}
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="3 3"
              opacity={0.7}
            />
          </ComposedChart>
        ) : (
          <LineChart
            data={formattedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            {/* Grid with trading-style appearance */}
            <CartesianGrid
              strokeDasharray="1 1"
              stroke="currentColor"
              className="stroke-muted-foreground/20"
              horizontal={true}
              vertical={false}
            />

            {/* X-axis */}
            <XAxis
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="fill-muted-foreground"
            />

            {/* Y-axis with trading-style formatting */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="fill-muted-foreground"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Zero line reference */}
            <ReferenceLine
              y={0}
              stroke="currentColor"
              className="stroke-muted-foreground/40"
              strokeWidth={1}
            />

            {/* Sales line - green dashed */}
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 4"
              opacity={0.8}
            />

            {/* Expenses line - red dashed */}
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 4"
              opacity={0.8}
            />

            {/* Profit line - main focus with trading-style appearance */}
            {showProfit && (
              <Line
                type="monotone"
                dataKey="profit"
                stroke={isPositiveTrend ? "#10b981" : "#ef4444"}
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                  stroke: isPositiveTrend ? "#10b981" : "#ef4444",
                  strokeWidth: 2,
                  fill: "white",
                }}
              />
            )}
          </LineChart>
        )}
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-0.5 bg-green-500 opacity-80"
            style={{ borderStyle: "dashed", borderWidth: "1px 0" }}
          ></div>
          <span className="text-muted-foreground">Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-0.5 bg-red-500 opacity-80"
            style={{ borderStyle: "dashed", borderWidth: "1px 0" }}
          ></div>
          <span className="text-muted-foreground">Expenses</span>
        </div>
        {showProfit && (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-0.5"
              style={{
                backgroundColor: isPositiveTrend ? "#10b981" : "#ef4444",
              }}
            ></div>
            <span className="text-muted-foreground">Profit</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TradingChart;
