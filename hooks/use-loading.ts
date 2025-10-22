/** @format */

"use client";

import { useState, useCallback } from "react";

interface UseLoadingOptions {
  initialLoading?: boolean;
}

export function useLoading(options: UseLoadingOptions = {}) {
  const [loading, setLoading] = useState(options.initialLoading ?? false);
  const [error, setError] = useState<string | null>(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const setLoadingError = useCallback((errorMessage: string) => {
    setLoading(false);
    setError(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
      try {
        startLoading();
        const result = await asyncFn();
        stopLoading();
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setLoadingError(errorMessage);
        return null;
      }
    },
    [startLoading, stopLoading, setLoadingError]
  );

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    clearError,
    withLoading,
  };
}

// Hook for managing multiple loading states
export function useMultipleLoading() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [key]: loading }));
    if (loading) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  }, []);

  const setError = useCallback((key: string, error: string | null) => {
    setErrors((prev) => ({ ...prev, [key]: error }));
    setLoadingStates((prev) => ({ ...prev, [key]: false }));
  }, []);

  const clearError = useCallback((key: string) => {
    setErrors((prev) => ({ ...prev, [key]: null }));
  }, []);

  const isLoading = useCallback(
    (key: string) => {
      return loadingStates[key] ?? false;
    },
    [loadingStates]
  );

  const getError = useCallback(
    (key: string) => {
      return errors[key] ?? null;
    },
    [errors]
  );

  const withLoading = useCallback(
    async <T>(key: string, asyncFn: () => Promise<T>): Promise<T | null> => {
      try {
        setLoading(key, true);
        const result = await asyncFn();
        setLoading(key, false);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(key, errorMessage);
        return null;
      }
    },
    [setLoading, setError]
  );

  return {
    setLoading,
    setError,
    clearError,
    isLoading,
    getError,
    withLoading,
    loadingStates,
    errors,
  };
}
