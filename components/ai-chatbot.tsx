/** @format */

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, X, Sparkles } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

interface BusinessData {
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  employees: number;
  lowStockItems: number;
  totalProducts: number;
  recentSales: Array<{ item: string; amount: number; date: string }>;
  recentExpenses: Array<{
    category: string;
    amount: number;
    description: string;
  }>;
  topExpenseCategory: string;
  topExpenseAmount: number;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI business assistant. Ask me about your sales, expenses, employees, or business performance. I can help you analyze trends and make better decisions.",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch business data when chatbot opens
  useEffect(() => {
    if (isOpen && !businessData && !dataLoading) {
      fetchBusinessData();
    }
  }, [isOpen]);

  const fetchBusinessData = async () => {
    setDataLoading(true);
    try {
      // Get user token from localStorage
      const userData = localStorage.getItem("user");
      const token = userData ? JSON.parse(userData).token : null;

      if (!token) {
        console.error("No auth token found");
        return;
      }

      const response = await fetch("/api/dashboard/metrics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        const data = result.data;
        setBusinessData({
          totalSales: data.totalSales,
          totalExpenses: data.totalExpenses,
          netProfit: data.netProfit,
          profitMargin: data.profitMargin,
          employees: data.recentActivity.filter(
            (activity: any) => activity.type === "employee"
          ).length,
          lowStockItems: data.lowStockItems,
          totalProducts: data.totalProducts,
          recentSales: data.chartData.slice(-5).map((item: any) => ({
            item: `Sales on ${item.date}`,
            amount: item.sales,
            date: item.date,
          })),
          recentExpenses: data.chartData.slice(-5).map((item: any) => ({
            category: "Daily Expenses",
            amount: item.expenses,
            description: `Expenses on ${item.date}`,
          })),
          topExpenseCategory: data.categoryData[0]?.category || "General",
          topExpenseAmount: data.categoryData[0]?.amount || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch business data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      if (!businessData) {
        return "I'm loading your business data. Please try again in a moment.";
      }

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          businessData: businessData, // VERY IMPORTANT
        }),
      });

      const result = await response.json();

      if (!result.success) {
        return "AI couldn't generate a response. Please try again.";
      }

      return result.response;
    } catch (error) {
      console.error("Chat API error:", error);
      return "Sorry, I couldn't process your request.";
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(userInput);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chatbot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg transition-all hover:scale-110 z-40 group animate-pulse-glow"
        title="Open AI Assistant"
      >
        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-96 bg-card border border-border/40 rounded-lg shadow-xl flex flex-col z-40 animate-slide-up">
          {/* Header */}
          <div className="p-4 border-b border-border/40 flex items-center justify-between bg-gradient-to-r from-orange-500/10 to-transparent">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <div>
                <h3 className="font-semibold text-foreground">
                  Business Assistant
                </h3>
                <p className="text-xs text-muted-foreground">
                  {dataLoading ? "Loading your data..." : "Powered by AI"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-secondary rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm transition-all duration-300 ease-out whitespace-pre-line ${
                    message.sender === "user"
                      ? "bg-orange-500 text-white rounded-br-none shadow-md hover:shadow-lg"
                      : "bg-secondary text-foreground rounded-bl-none shadow-sm hover:shadow-md"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary text-foreground px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/40 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 bg-secondary border border-border/40 text-foreground placeholder:text-muted-foreground focus:border-orange-500/50 transition-all duration-300 ease-out"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 transition-all duration-300 ease-out"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
