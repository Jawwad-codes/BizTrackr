/** @format */

import { APIResponse } from "./models/types";

interface RequestOptions {
  retries?: number;
  timeout?: number;
  signal?: AbortSignal;
}

export class ApiClient {
  private defaultTimeout = 10000; // 10 seconds
  private defaultRetries = 3;

  private getAuthHeaders(): HeadersInit {
    const userData = localStorage.getItem("user");
    const token = userData ? JSON.parse(userData).token : null;

    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit,
    requestOptions: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    const { retries = this.defaultRetries, timeout = this.defaultTimeout } =
      requestOptions;

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Use provided signal or create new one
        const signal = requestOptions.signal || controller.signal;

        const response = await fetch(url, {
          ...options,
          headers: this.getAuthHeaders(),
          signal,
        });

        clearTimeout(timeoutId);

        // Handle HTTP errors
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage: string;

          try {
            const errorJson = JSON.parse(errorText);
            errorMessage =
              errorJson.error?.message ||
              errorJson.message ||
              `HTTP ${response.status}: ${response.statusText}`;
          } catch {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }

          throw new Error(errorMessage);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            throw new Error("Request timeout - please try again");
          }

          // Don't retry on client errors (4xx)
          if (error.message.includes("HTTP 4")) {
            throw error;
          }
        }

        // If this is the last attempt, throw the error
        if (attempt === retries) {
          throw lastError;
        }

        // Exponential backoff: wait 1s, 2s, 4s...
        const backoffDelay = Math.pow(2, attempt) * 1000;
        await this.delay(backoffDelay);
      }
    }

    throw lastError!;
  }

  async get<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    return this.makeRequest<T>(url, { method: "GET" }, options);
  }

  async post<T>(
    url: string,
    data: any,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    return this.makeRequest<T>(
      url,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      options
    );
  }

  async put<T>(
    url: string,
    data: any,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    return this.makeRequest<T>(
      url,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      options
    );
  }

  async delete<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    return this.makeRequest<T>(url, { method: "DELETE" }, options);
  }
}

export const apiClient = new ApiClient();
