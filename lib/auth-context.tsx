/** @format */

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  email: string;
  name: string;
  token: string;
  createdAt?: string;
  businessName?: string;
  businessType?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on app start
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async (): Promise<void> => {
    return new Promise((resolve) => {
      try {
        // Clear client-side data immediately
        setUser(null);
        localStorage.removeItem("user");
        localStorage.clear(); // Clear all localStorage for safety

        // Call logout API in the background (don't wait for it)
        fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }).catch((error) => {
          console.warn("Logout API call failed:", error);
        });

        // Use setTimeout to ensure state updates are processed
        setTimeout(() => {
          window.location.href = "/";
          resolve();
        }, 100);
      } catch (error) {
        console.error("Logout error:", error);
        // Even if there's an error, still redirect
        window.location.href = "/";
        resolve();
      }
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're sure there's no user and not loading
    // The middleware should handle most redirects, this is a fallback
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      if (
        currentPath !== "/login" &&
        currentPath !== "/register" &&
        currentPath !== "/"
      ) {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  return { user, loading };
}
