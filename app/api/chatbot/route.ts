/** @format */

import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { message, businessData } = await req.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    // OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { success: false, error: "OpenAI API key is missing" },
        { status: 500 }
      );
    }

    // Build system prompt with business data
    const systemPrompt = `
You are a friendly, helpful business assistant chatbot named BizBot.
Answer the user's question naturally and conversationally based on their business data.

BUSINESS DATA:
- Total Sales: $${businessData.totalSales?.toLocaleString() || "0"}
- Total Expenses: $${businessData.totalExpenses?.toLocaleString() || "0"}
- Net Profit: $${businessData.netProfit?.toLocaleString() || "0"}
- Profit Margin: ${businessData.profitMargin?.toFixed(1) || "0"}%
- Total Products: ${businessData.totalProducts || 0}
- Low Stock Items: ${businessData.lowStockItems || 0}
- Top Expense Category: ${businessData.topExpenseCategory || "N/A"} ($${
      businessData.topExpenseAmount?.toLocaleString() || "0"
    })

INSTRUCTIONS:
- Respond naturally like a friendly business advisor
- Keep it brief (2-3 sentences)
- Use emojis sparingly
- Avoid repeating phrases
- Provide actionable advice if possible
- If missing data, say so politely
`;

    // Call OpenAI Chat API
    // Call OpenAI Chat API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.9,
        max_tokens: 200,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API request failed. Check server logs.",
        },
        { status: 500 }
      );
    }

    const aiText = data?.choices?.[0]?.message?.content;
    if (!aiText) {
      return NextResponse.json(
        { success: false, error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      response: aiText.trim(),
    });
  } catch (error) {
    console.error("Chatbot API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
