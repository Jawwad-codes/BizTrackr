/** @format */

"use client";

import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

interface ModernChartProps {
  data: ChartDataPoint[];
  type?: "area" | "bar" | "line";
  dataKeys: { key: string; color: string; name: string }[];
  height?: number;
  title?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  animate?: boolean;
}

export function ModernChart({
  data,
  type = "area",
  dataKeys,
  height = 300,
  title,
  showLegend = true,
  showGrid = true,
  animate = true,
}: ModernChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background/95 backdrop-blur-lg border border-border rounded-xl p-4 shadow-2xl"
        >
          <p className="font-semibold text-foreground mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.name}:
                  </span>
                </div>
                <span className="font-medium text-foreground">
                  ${entry.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    const commonAxisProps = {
      axisLine: false,
      tickLine: false,
      tick: { fontSize: 12, fill: "currentColor" },
      className: "fill-muted-foreground",
    };

    switch (type) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              {dataKeys.map((item, index) => (
                <linearGradient
                  key={item.key}
                  id={`gradient-${item.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={item.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={item.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="stroke-muted-foreground/10"
                vertical={false}
              />
            )}
            <XAxis dataKey="name" {...commonAxisProps} />
            <YAxis
              {...commonAxisProps}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
            )}
            {dataKeys.map((item) => (
              <Area
                key={item.key}
                type="monotone"
                dataKey={item.key}
                stroke={item.color}
                strokeWidth={3}
                fill={`url(#gradient-${item.key})`}
                name={item.name}
                animationDuration={animate ? 1500 : 0}
                animationBegin={0}
              />
            ))}
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="stroke-muted-foreground/10"
                vertical={false}
              />
            )}
            <XAxis dataKey="name" {...commonAxisProps} />
            <YAxis
              {...commonAxisProps}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
            )}
            {dataKeys.map((item) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                fill={item.color}
                name={item.name}
                radius={[8, 8, 0, 0]}
                animationDuration={animate ? 1500 : 0}
                animationBegin={0}
              />
            ))}
          </BarChart>
        );

      case "line":
        return (
          <LineChart {...commonProps}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="stroke-muted-foreground/10"
                vertical={false}
              />
            )}
            <XAxis dataKey="name" {...commonAxisProps} />
            <YAxis
              {...commonAxisProps}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
            )}
            {dataKeys.map((item) => (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                stroke={item.color}
                strokeWidth={3}
                name={item.name}
                dot={{ r: 4, fill: item.color, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                animationDuration={animate ? 1500 : 0}
                animationBegin={0}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 border border-border/40 bg-card/80 backdrop-blur-sm rounded-xl"
    >
      {title && (
        <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </motion.div>
  );
}

export default ModernChart;
