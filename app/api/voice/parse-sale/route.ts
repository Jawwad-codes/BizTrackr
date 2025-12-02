/** @format */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { success: false, error: "No transcript provided" },
        { status: 400 }
      );
    }

    const prompt = `Extract structured sales data from this transcript:
"${transcript}"

Return ONLY a JSON object with these exact fields:
{
  "item": string (product name),
  "quantity": number (how many units),
  "amount": number (unit price in dollars),
  "date": "YYYY-MM-DD" (today's date if not specified)
}

If something is missing, use null.
Today's date: ${new Date().toISOString().split("T")[0]}

Examples:
"Soap quantity 40 price 5 dollars" → {"item":"Soap","quantity":40,"amount":5,"date":"${
      new Date().toISOString().split("T")[0]
    }"}
"Sold 10 units of bread for 20 dollars" → {"item":"bread","quantity":10,"amount":2,"date":"${
      new Date().toISOString().split("T")[0]
    }"}

Return ONLY the JSON object, no explanation.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a sales data parser. Extract structured data from voice transcripts and return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const responseText = completion.choices[0].message.content || "{}";
    const json = JSON.parse(responseText);

    // Validate and clean the data
    const validatedData = {
      item: json.item || null,
      quantity: json.quantity ? Number(json.quantity) : null,
      amount: json.amount ? Number(json.amount) : null,
      date: json.date || new Date().toISOString().split("T")[0],
    };

    return NextResponse.json({
      success: true,
      data: validatedData,
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process voice input",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
