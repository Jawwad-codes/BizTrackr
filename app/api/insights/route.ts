/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import SaleModel from "@/lib/models/Sale";
import ExpenseModel from "@/lib/models/Expense";
import InventoryModel from "@/lib/models/Inventory";
import EmployeeModel from "@/lib/models/Employee";
import { getUserFromRequest } from "@/lib/auth";
import OpenAI from "openai";

/**
 * Insights route -- returns:
 * {
 *   success: true,
 *   data: {
 *     insights: string,
 *     metrics: { ... },
 *     alerts: { lowStock: [...], outOfStock: [...] }
 *   }
 * }
 *
 * Ensures alerts.lowStock and alerts.outOfStock are always present (arrays).
 */

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Authentication required" } },
        { status: 401 }
      );
    }

    // Connect DB
    await connectToDatabase();

    // Fetch user data
    const [sales, expenses, inventory, employees] = await Promise.all([
      SaleModel.find({ userId: user.userId }).sort({ date: -1 }),
      ExpenseModel.find({ userId: user.userId }).sort({ date: -1 }),
      InventoryModel.find({ userId: user.userId }).sort({ createdAt: -1 }),
      EmployeeModel.find({ userId: user.userId }).sort({ createdAt: -1 }),
    ]);

    // METRICS
    const totalSales = (sales || []).reduce(
      (sum, sale) => sum + (sale.amount || 0) * (sale.quantity || 1),
      0
    );

    const totalExpenses = (expenses || []).reduce(
      (sum, exp) => sum + (exp.amount || 0),
      0
    );

    const totalSalaries = (employees || []).reduce(
      (sum, emp) => sum + (emp.salary || 0),
      0
    );

    const totalExpensesWithSalaries = totalExpenses + totalSalaries;
    const netProfit = totalSales - totalExpensesWithSalaries;
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    const lowStockItems = (inventory || []).filter(
      (item) => (item.stock ?? 0) <= (item.reorderLevel ?? 0)
    );
    const outOfStockItems = (inventory || []).filter(
      (item) => (item.stock ?? 0) === 0
    );

    const totalInventoryValue = (inventory || []).reduce(
      (sum, item) => sum + (item.sellingPrice || 0) * (item.stock || 0),
      0
    );

    const totalInventoryCost = (inventory || []).reduce(
      (sum, item) => sum + (item.costPrice || 0) * (item.stock || 0),
      0
    );

    // 30-day trend
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentSales = (sales || []).filter(
      (s) => new Date(s.date) >= thirtyDaysAgo
    );
    const previousSales = (sales || []).filter(
      (s) =>
        new Date(s.date) >= sixtyDaysAgo && new Date(s.date) < thirtyDaysAgo
    );

    const recentSalesTotal = recentSales.reduce(
      (sum, s) => sum + (s.amount || 0) * (s.quantity || 1),
      0
    );
    const previousSalesTotal = previousSales.reduce(
      (sum, s) => sum + (s.amount || 0) * (s.quantity || 1),
      0
    );
    const salesGrowth =
      previousSalesTotal > 0
        ? ((recentSalesTotal - previousSalesTotal) / previousSalesTotal) * 100
        : 0;

    // expenses by category
    const expensesByCategory = (expenses || []).reduce(
      (acc: Record<string, number>, exp) => {
        const key = exp.category || "Uncategorized";
        acc[key] = (acc[key] || 0) + (exp.amount || 0);
        return acc;
      },
      {}
    );

    // top selling items by revenue
    const salesByItem = (sales || []).reduce(
      (acc: Record<string, number>, sale) => {
        const name = sale.item || "Unknown item";
        acc[name] =
          (acc[name] || 0) + (sale.amount || 0) * (sale.quantity || 1);
        return acc;
      },
      {}
    );

    const topSellingItems = Object.entries(salesByItem)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);

    // health status
    const isHealthy =
      profitMargin > 20 && (lowStockItems.length || 0) < 3 && netProfit > 0;
    const hasWarnings =
      profitMargin < 10 || (lowStockItems.length || 0) > 5 || netProfit < 0;
    const isCritical =
      profitMargin < 0 ||
      (outOfStockItems.length || 0) > 3 ||
      netProfit < -1000;

    let healthStatus = "STABLE";
    if (isCritical) healthStatus = "CRITICAL";
    else if (hasWarnings) healthStatus = "NEEDS ATTENTION";
    else if (isHealthy) healthStatus = "HEALTHY";

    // Build prompt (keep concise but informative)
    const topItemsText =
      topSellingItems.length > 0
        ? topSellingItems
            .map(
              ([item, amount]) =>
                `• ${item}: $${(amount as number).toLocaleString()}`
            )
            .join("\n")
        : "• No sales data";

    const expensesText =
      Object.keys(expensesByCategory).length > 0
        ? Object.entries(expensesByCategory)
            .map(([cat, amt]) => `• ${cat}: $${amt.toLocaleString()}`)
            .join("\n")
        : "• No expenses data";

    const prompt = `You are BizBot, a senior business analyst. Create a professional business analysis report in plain text with CAPITAL LETTER HEADERS and NO markdown.

FINANCIAL OVERVIEW:
Total Sales: $${totalSales.toLocaleString()} (${
      (sales || []).length
    } transactions)
Total Expenses: $${totalExpenses.toLocaleString()} (${
      (expenses || []).length
    } expenses)
Employee Salaries: $${totalSalaries.toLocaleString()}
Net Profit: $${netProfit.toLocaleString()}
Profit Margin: ${profitMargin.toFixed(1)}%
Sales Growth (30-day): ${salesGrowth.toFixed(1)}%

TOP SELLING ITEMS:
${topItemsText}

EXPENSE BREAKDOWN:
${expensesText}

INVENTORY:
Total Items: ${inventory.length}
Total Inventory Value: $${totalInventoryValue.toLocaleString()}
Low Stock Items: ${lowStockItems.length}
Out of Stock Items: ${outOfStockItems.length}

TEAM:
Employees: ${employees.length}
Monthly Payroll: $${totalSalaries.toLocaleString()}

BUSINESS HEALTH STATUS: ${healthStatus}

Write clear, actionable recommendations and a summary. Use capital headers only for section titles (no markdown).`;

    // CALL OPENAI (new SDK)
    let aiInsights = "";
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not set, using fallback insights.");
      aiInsights = generateFallbackInsights(
        totalSales,
        totalExpenses,
        totalSalaries,
        totalExpensesWithSalaries,
        netProfit,
        profitMargin,
        lowStockItems,
        outOfStockItems,
        employees,
        salesGrowth,
        healthStatus
      );
    } else {
      try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await client.responses.create({
          model: "gpt-4o-mini",
          input: [
            {
              role: "system",
              content:
                "You are BizBot, an expert business analyst. Provide a plain-text report with CAPITAL HEADER LINES and no markdown.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_output_tokens: 1200,
        });

        // prefer output_text but also try structured output
        aiInsights =
          // @ts-ignore - legacy helper
          completion.output_text ||
          // fallback to earliest content in output
          (Array.isArray((completion.output || []) as any)
            ? (completion.output as any[])
                .map((o) => o.content?.map?.((c: any) => c.text).join("") || "")
                .join("\n") || ""
            : "");
        if (!aiInsights) {
          // If empty, use fallback
          aiInsights = generateFallbackInsights(
            totalSales,
            totalExpenses,
            totalSalaries,
            totalExpensesWithSalaries,
            netProfit,
            profitMargin,
            lowStockItems,
            outOfStockItems,
            employees,
            salesGrowth,
            healthStatus
          );
        }
      } catch (apiErr) {
        console.error("OpenAI call failed:", apiErr);
        aiInsights = generateFallbackInsights(
          totalSales,
          totalExpenses,
          totalSalaries,
          totalExpensesWithSalaries,
          netProfit,
          profitMargin,
          lowStockItems,
          outOfStockItems,
          employees,
          salesGrowth,
          healthStatus
        );
      }
    }

    // Build stable alerts arrays (frontend expects these)
    const alerts = {
      lowStock: (lowStockItems || []).map((it) => ({
        name: it.productName || it.name || "Unknown",
        current: it.stock ?? 0,
        minimum: it.reorderLevel ?? 0,
      })),
      outOfStock: (outOfStockItems || []).map((it) => ({
        name: it.productName || it.name || "Unknown",
      })),
    };

    const responseData = {
      success: true,
      data: {
        insights: aiInsights,
        metrics: {
          totalSales,
          totalExpenses,
          totalSalaries,
          totalExpensesWithSalaries,
          netProfit,
          profitMargin: profitMargin.toFixed(1),
          lowStockCount: (lowStockItems || []).length,
          outOfStockCount: (outOfStockItems || []).length,
          employeeCount: (employees || []).length,
          salesGrowth: salesGrowth.toFixed(1),
          totalInventoryValue,
          totalInventoryCost,
          healthStatus,
          isHealthy,
          hasWarnings,
          isCritical,
        },
        alerts,
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Insights handler error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to generate insights" } },
      { status: 500 }
    );
  }
}

/* Fallback insights (keeps previous structure and wording) */
function generateFallbackInsights(
  totalSales: number,
  totalExpenses: number,
  totalSalaries: number,
  totalExpensesWithSalaries: number,
  netProfit: number,
  profitMargin: number,
  lowStockItems: any[],
  outOfStockItems: any[],
  employees: any[],
  salesGrowth: number,
  healthStatus: string
): string {
  return `
BUSINESS HEALTH SUMMARY

Your business is currently in ${healthStatus} status. ${
    netProfit >= 0
      ? `You are generating a profit of $${netProfit.toLocaleString()} with a ${profitMargin.toFixed(
          1
        )}% margin.`
      : `You are operating at a loss of $${Math.abs(
          netProfit
        ).toLocaleString()}.`
  } ${
    salesGrowth > 0
      ? `Sales are growing by ${salesGrowth.toFixed(1)}% month-over-month.`
      : salesGrowth < 0
      ? `Sales have declined by ${Math.abs(salesGrowth).toFixed(
          1
        )}% - immediate action needed.`
      : "Sales are stable."
  }

${
  outOfStockItems.length > 0 || lowStockItems.length > 5
    ? `CRITICAL ALERTS

${
  outOfStockItems.length > 0
    ? `OUT OF STOCK (${outOfStockItems.length} items):\n${outOfStockItems
        .map(
          (item) =>
            `- ${item.productName || item.name || "Unknown"} - URGENT RESTOCK!`
        )
        .join("\n")}\n\n`
    : ""
}${
        lowStockItems.length > 0
          ? `LOW STOCK (${lowStockItems.length} items):\n${lowStockItems
              .map(
                (item) =>
                  `- ${item.productName || item.name || "Unknown"}: ${
                    item.stock
                  } units (Min: ${item.reorderLevel})`
              )
              .join("\n")}`
          : ""
      }`
    : ""
}

KEY INSIGHTS & TRENDS

Financial Health: ${
    profitMargin > 20
      ? "Excellent profit margin - business is very healthy"
      : profitMargin > 10
      ? "Moderate profit margin - room for improvement"
      : profitMargin > 0
      ? "Low profit margin - focus on cost reduction"
      : "Negative margin - urgent action required"
  }

Sales Trend: ${
    salesGrowth > 10
      ? "Strong growth - capitalize on momentum"
      : salesGrowth > 0
      ? "Steady growth - maintain current strategies"
      : salesGrowth > -10
      ? "Slight decline - review marketing efforts"
      : "Significant decline - immediate intervention needed"
  }

Inventory Management: ${
    outOfStockItems.length > 0
      ? "Critical - multiple stockouts affecting sales"
      : lowStockItems.length > 5
      ? "Needs attention - several items running low"
      : lowStockItems.length > 0
      ? "Mostly healthy - monitor low stock items"
      : "Low Inventory"
  }

Team Efficiency: ${
    employees.length > 0
      ? `${
          employees.length
        } employees managing $${totalSales.toLocaleString()} in sales`
      : "No employees recorded"
  }

Expense Control: ${
    totalExpenses > totalSales * 0.8
      ? "Expenses too high - urgent cost reduction needed"
      : totalExpenses > totalSales * 0.6
      ? "Expenses moderate - look for optimization opportunities"
      : "Expenses well-controlled"
  }

ACTIONABLE RECOMMENDATIONS

${
  outOfStockItems.length > 0
    ? `HIGH PRIORITY: Immediately restock ${outOfStockItems.length} out-of-stock items to prevent lost sales\n`
    : ""
}${
    lowStockItems.length > 0
      ? `${
          outOfStockItems.length > 0 ? "" : "HIGH PRIORITY: "
        }Order inventory for ${
          lowStockItems.length
        } low-stock items before they run out\n`
      : ""
  }${
    profitMargin < 10
      ? `HIGH PRIORITY: Review and reduce expenses - target 20% cost reduction\n`
      : ""
  }${
    salesGrowth < 0
      ? `MEDIUM PRIORITY: Implement marketing campaign to boost declining sales\n`
      : ""
  }MEDIUM PRIORITY: Analyze top-selling items and increase their stock levels
MEDIUM PRIORITY: Review expense categories and eliminate non-essential costs
LOW PRIORITY: Set up automated inventory alerts to prevent future stockouts

PRIORITY ACTION PLAN (THIS WEEK)

Day 1-2: ${
    outOfStockItems.length > 0
      ? `Place urgent orders for ${outOfStockItems.length} out-of-stock items`
      : lowStockItems.length > 0
      ? `Order inventory for ${lowStockItems.length} low-stock items`
      : "Review all inventory levels and set reorder points"
  }

Day 3-4: ${
    profitMargin < 10
      ? "Conduct expense audit and identify 3-5 cost-cutting opportunities"
      : salesGrowth < 0
      ? "Launch targeted marketing campaign to boost sales"
      : "Analyze top-selling items and plan inventory expansion"
  }

Day 5-7: ${
    netProfit < 0
      ? "Implement immediate cost reductions and review pricing strategy"
      : "Review weekly performance and adjust strategies as needed"
  }

Note: This analysis is based on your available business data.
`;
}
