/** @format */

"use client";

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface APIErrorProps {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function APIError({
  error,
  onRetry,
  onDismiss,
  className,
}: APIErrorProps) {
  if (!error) return null;

  const isNetworkError =
    error.toLowerCase().includes("network") ||
    error.toLowerCase().includes("fetch") ||
    error.toLowerCase().includes("connection");

  const isServerError =
    error.toLowerCase().includes("server") ||
    error.toLowerCase().includes("500") ||
    error.toLowerCase().includes("503");

  const getErrorIcon = () => {
    if (isNetworkError) return <WifiOff className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getErrorTitle = () => {
    if (isNetworkError) return "Connection Error";
    if (isServerError) return "Server Error";
    return "Error";
  };

  const getErrorMessage = () => {
    if (isNetworkError) {
      return "Unable to connect to the server. Please check your internet connection and try again.";
    }
    if (isServerError) {
      return "The server is experiencing issues. Please try again in a few moments.";
    }
    return error;
  };

  return (
    <Alert variant="destructive" className={className}>
      {getErrorIcon()}
      <AlertTitle>{getErrorTitle()}</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>{getErrorMessage()}</p>
        <div className="flex gap-2">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="h-8"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="h-8"
            >
              Dismiss
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Hook for consistent API error handling
export function useAPIError() {
  const [error, setError] = React.useState<string | null>(null);

  const handleError = React.useCallback((err: any) => {
    console.error("API Error:", err);

    if (err instanceof Error) {
      setError(err.message);
    } else if (typeof err === "string") {
      setError(err);
    } else if (err?.error?.message) {
      setError(err.error.message);
    } else {
      setError("An unexpected error occurred");
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
}
