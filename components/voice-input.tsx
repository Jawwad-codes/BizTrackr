/** @format */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  onParsedData?: (data: ParsedSaleData) => void;
  disabled?: boolean;
}

interface ParsedSaleData {
  item?: string;
  amount?: number;
  quantity?: number;
  date?: string;
}

export function VoiceInput({
  onTranscript,
  onParsedData,
  disabled = false,
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if browser supports speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log("🎤 Transcript received:", transcript);
          setTranscript(transcript);
          onTranscript(transcript);
          setIsRecording(false);
          setIsProcessing(true);

          // Parse the transcript using AI
          parseSaleDataWithAI(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
          setIsProcessing(false);
          setStatus("error");

          // Don't show error toast for network errors during initialization
          if (event.error !== "network" || isRecording) {
            toast({
              title: "Voice Recognition Error",
              description: getErrorMessage(event.error),
              variant: "destructive",
            });
          }
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, toast, isRecording]);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "no-speech":
        return "No speech detected. Please try again.";
      case "audio-capture":
        return "No microphone found. Please check your device.";
      case "not-allowed":
        return "Microphone access denied. Please allow microphone access.";
      case "network":
        return "Network error. Check your internet connection and try again.";
      case "aborted":
        return "Recording was stopped.";
      case "service-not-allowed":
        return "Speech service not available. Try using Chrome browser.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  const parseSaleDataWithAI = async (text: string) => {
    try {
      console.log("🚀 Sending to AI API:", text);

      // Use AI API to parse the transcript
      const response = await fetch("/api/voice/parse-sale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript: text }),
      });

      console.log("📡 API Response status:", response.status);

      const result = await response.json();
      console.log("📦 API Result:", JSON.stringify(result, null, 2));

      setIsProcessing(false);

      if (result.success && result.data) {
        const parsed = result.data;
        console.log("✅ Parsed data:", parsed);

        // Check if we got meaningful data
        if (parsed.item || parsed.amount || parsed.quantity) {
          setStatus("success");

          console.log("🔄 Calling onParsedData callback");
          console.log("📋 Data to pass:", parsed);

          if (onParsedData) {
            onParsedData(parsed);
            console.log("✅ onParsedData called successfully!");
          } else {
            console.error("❌ onParsedData callback is undefined!");
          }

          toast({
            title: "✅ Voice Input Processed",
            description: `${parsed.item || "?"} - Qty: ${
              parsed.quantity || "?"
            } - Price: $${parsed.amount || "?"}`,
          });
        } else {
          console.warn("⚠️ No meaningful data in parsed result:", parsed);
          setStatus("error");
          toast({
            title: "Could Not Parse Data",
            description: "AI couldn't extract sale data. Try again.",
            variant: "destructive",
          });
        }
      } else {
        console.error("❌ API returned error:", result);
        setStatus("error");
        toast({
          title: "Parsing Error",
          description: result.error || "Could not understand the input.",
          variant: "destructive",
        });
      }

      // Reset status after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      console.error("💥 Error parsing sale data:", error);
      setIsProcessing(false);
      setStatus("error");

      toast({
        title: "Parsing Error",
        description: "Could not connect to AI service. Check console.",
        variant: "destructive",
      });

      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description:
          "Voice recognition is not supported in your browser. Try Chrome.",
        variant: "destructive",
      });
      return;
    }

    try {
      setTranscript("");
      setStatus("idle");

      // Try to start recognition
      recognitionRef.current.start();
      setIsRecording(true);

      toast({
        title: "🎤 Listening...",
        description: "Speak your sale details now",
      });
    } catch (error: any) {
      console.error("Error starting recognition:", error);

      // Handle "already started" error
      if (error.message && error.message.includes("already started")) {
        recognitionRef.current.stop();
        setTimeout(() => {
          try {
            recognitionRef.current.start();
            setIsRecording(true);
          } catch (retryError) {
            console.error("Retry failed:", retryError);
            toast({
              title: "Error",
              description:
                "Could not start voice recognition. Please refresh the page.",
              variant: "destructive",
            });
          }
        }, 100);
      } else {
        toast({
          title: "Error",
          description:
            "Could not start voice recognition. Check your microphone.",
          variant: "destructive",
        });
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={toggleRecording}
          disabled={disabled || isProcessing}
          variant={isRecording ? "destructive" : "outline"}
          size="lg"
          className={`relative ${
            isRecording
              ? "animate-pulse bg-red-500 hover:bg-red-600"
              : "hover:bg-primary/10"
          }`}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isRecording ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
          <span className="ml-2">
            {isProcessing
              ? "Processing with AI..."
              : isRecording
              ? "Stop Recording"
              : "🎤 Voice Input (AI)"}
          </span>
        </Button>

        {status === "success" && (
          <CheckCircle2 className="h-5 w-5 text-green-500 animate-in fade-in" />
        )}
        {status === "error" && (
          <XCircle className="h-5 w-5 text-red-500 animate-in fade-in" />
        )}
      </div>

      {transcript && (
        <div className="p-3 bg-muted rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-1">Transcript:</p>
          <p className="text-sm">{transcript}</p>
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p className="font-medium">💡 Voice Input Tips (AI-Powered):</p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>Say: "Soap quantity 40 price 5 dollars"</li>
          <li>Or: "Sold 10 units of bread for $20"</li>
          <li>Or: "Shampoo 5 pieces at $15 each"</li>
          <li>AI will understand natural speech patterns!</li>
        </ul>
        <p className="text-xs text-muted-foreground/70 mt-2">
          ⚠️ Requires internet connection & GEMINI_API_KEY. Check browser
          console for logs.
        </p>
      </div>
    </div>
  );
}

export default VoiceInput;
