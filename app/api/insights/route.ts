/** @format */

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import SaleModel from "@/lib/models/Sale";
import ExpenseModel from "@/lib/models/Expense";
import InventoryModel from "@/lib/models/Inventory";
import EmployeeModel from "@/lib/models/Employee";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Authentication required" } },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Fetch user's business data
    const [sales, expenses, inventory, employees] = await Promise.all([
      SaleModel.find({ userId: user.userId }).sort({ date: -1 }).limit(10),
      ExpenseModel.find({ userId: user.userId }).sort({ date: -1 }).limit(10),
      InventoryModel.find({ userId: user.userId })
        .sort({ createdAt: -1 })
        .limit(10),
      EmployeeModel.find({ userId: user.userId })
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    // Calculate key metrics
    const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const netProfit = totalSales - totalExpenses;
    const lowStockItems = inventory.filter(
      (item) => item.stock <= item.reorderLevel
    );

    // Create AI prompt with business data
    const prompt = `
You are BizBot, an AI business analyst for BizTrack. Analyze this business data and provide actionable insights:

FINANCIAL SUMMARY:
- Total Sales (recent): $${totalSales.toLocaleString()}
- Total Expenses (recent): $${totalExpenses.toLocaleString()}
- Net Profit: $${netProfit.toLocaleString()}
- Profit Margin: ${
      totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0
    }%

SALES DATA (${sales.length} recent transactions):
${sales
  .map((sale) => `- ${sale.item}: $${sale.amount} (${sale.date})`)
  .join("\n")}

EXPENSE DATA (${expenses.length} recent expenses):
${expenses
  .map(
    (expense) =>
      `- ${expense.category}: $${expense.amount} (${expense.description})`
  )
  .join("\n")}

INVENTORY STATUS (${inventory.length} items):
${inventory
  .map(
    (item) =>
      `- ${item.productName}: ${item.stock} units (Min: ${item.reorderLevel})`
  )
  .join("\n")}

LOW STOCK ALERTS: ${lowStockItems.length} items need restocking
${lowStockItems
  .map((item) => `- ${item.productName}: Only ${item.stock} left!`)
  .join("\n")}

EMPLOYEES: ${employees.length} team members
${employees
  .map((emp) => `- ${emp.name}: ${emp.role} ($${emp.salary}/month)`)
  .join("\n")}

Please provide:
1. Business Health Summary (2-3 sentences)
2. Key Insights & Trends (3-4 bullet points)
3. Actionable Recommendations (3-4 specific suggestions)
4. Priority Actions (what to do first)

Keep it concise, actionable, and business-focused. Use a professional but friendly tone.
    `;

    // Call Gemini API
    let aiInsights = "";

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not found in environment variables");
      aiInsights = `
**Business Analysis (Local Analysis):**

**Financial Summary:**
Your business shows $${totalSales.toLocaleString()} in recent sales with $${totalExpenses.toLocaleString()} in expenses, resulting in a net ${
        netProfit >= 0 ? "profit" : "loss"
      } of $${Math.abs(netProfit).toLocaleString()}.

**Key Performance Indicators:**
• Profit Margin: ${
        totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0
      }%
• Inventory Alerts: ${lowStockItems.length} items need restocking
• Team Size: ${employees.length} employees
• Transaction Volume: ${sales.length} recent sales

**Action Items:**
${
  lowStockItems.length > 0
    ? `• **Priority**: Restock ${lowStockItems
        .map((item) => item.productName)
        .join(", ")}`
    : "• Inventory levels are healthy"
}
• ${
        netProfit >= 0
          ? "Continue profitable strategies"
          : "Review expense optimization"
      }
• Monitor cash flow trends regularly

*Note: AI analysis requires API configuration. This is a basic summary of your business data.*
      `;
    } else {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "Gemini API Error:",
            response.status,
            response.statusText,
            errorText
          );

          // Fallback to basic analysis if API fails
          aiInsights = `
**Business Health Summary:**
Your business shows ${
            netProfit >= 0 ? "positive" : "negative"
          } performance with $${totalSales.toLocaleString()} in recent sales and $${totalExpenses.toLocaleString()} in expenses, resulting in a net ${
            netProfit >= 0 ? "profit" : "loss"
          } of $${Math.abs(netProfit).toLocaleString()}.

**Key Insights:**
• Profit Margin: ${
            totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0
          }%
• Inventory Status: ${lowStockItems.length} items need restocking
• Team Size: ${employees.length} employees
• Recent Activity: ${sales.length} sales and ${
            expenses.length
          } expenses recorded

**Recommendations:**
${
  lowStockItems.length > 0
    ? `• Restock low inventory items: ${lowStockItems
        .map((item) => item.productName)
        .join(", ")}`
    : "• Inventory levels are healthy"
}
• ${
            netProfit >= 0
              ? "Continue current profitable strategies"
              : "Review expenses to improve profitability"
          }
• Monitor cash flow and maintain detailed records
• Consider expanding successful product lines

**Priority Actions:**
${
  lowStockItems.length > 0
    ? "1. Immediate restocking of low inventory items"
    : "1. Maintain current inventory levels"
}
2. ${
            netProfit >= 0
              ? "Reinvest profits for growth"
              : "Reduce unnecessary expenses"
          }
3. Regular business performance reviews
        `;
        } else {
          const data = await response.json();
          aiInsights =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Unable to generate detailed insights at this time.";
        }
      } catch (apiError) {
        console.error("Gemini API Call Failed:", apiError);

        // Fallback analysis
        aiInsights = `
**Business Analysis (Generated Locally):**

**Financial Overview:**
Your business currently shows $${totalSales.toLocaleString()} in recent sales with $${totalExpenses.toLocaleString()} in expenses, resulting in a ${
          netProfit >= 0 ? "profit" : "loss"
        } of $${Math.abs(netProfit).toLocaleString()}.

**Key Metrics:**
• Profit Margin: ${
          totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0
        }%
• Low Stock Items: ${lowStockItems.length} items need attention
• Active Employees: ${employees.length} team members
• Recent Transactions: ${sales.length} sales, ${expenses.length} expenses

**Immediate Actions Needed:**
${
  lowStockItems.length > 0
    ? `• **URGENT**: Restock these items: ${lowStockItems
        .map((item) => `${item.productName} (${item.stock} left)`)
        .join(", ")}`
    : "• Inventory levels are currently adequate"
}
• ${
          netProfit >= 0
            ? "Maintain current profitable operations"
            : "Review and reduce unnecessary expenses"
        }
• Monitor daily cash flow and sales trends

**Growth Opportunities:**
• Analyze your best-selling items for expansion opportunities
• Consider seasonal trends in your sales data
• Optimize inventory turnover to improve cash flow
• Regular financial reviews to identify cost-saving opportunities

*Note: AI analysis temporarily unavailable. This is a basic business summary based on your data.*
      `;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        insights: aiInsights,
        metrics: {
          totalSales,
          totalExpenses,
          netProfit,
          profitMargin:
            totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0,
          lowStockCount: lowStockItems.length,
          employeeCount: employees.length,
        },
      },
    });
  } catch (error) {
    console.error("AI Insights error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to generate insights" },
      },
      { status: 500 }
    );
  }
}
