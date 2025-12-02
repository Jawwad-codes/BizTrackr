/** @format */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Users,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  Brain,
  Download,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/sales", label: "Sales", icon: TrendingUp },
  { href: "/expenses", label: "Expenses", icon: CreditCard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/insights", label: "AI Insights", icon: Brain },
  { href: "/pricing", label: "Pricing", icon: Zap },
  { href: "/export", label: "Export Data", icon: Download },
  { href: "/profile", label: "Profile", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    try {
      // Call the auth context logout
      logout().catch((error) => {
        console.error("Auth context logout failed:", error);
        // Fallback logout
        performFallbackLogout();
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Immediate fallback
      performFallbackLogout();
    }
  };

  const performFallbackLogout = () => {
    try {
      // Clear all client-side data
      localStorage.clear();
      sessionStorage.clear();

      // Call logout API
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {
        console.warn("Logout API failed in fallback");
      });

      // Redirect
      window.location.href = "/";
    } catch (error) {
      console.error("Fallback logout failed:", error);
      // Last resort - just redirect
      window.location.replace("/");
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-secondary border border-border/40 text-foreground transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:translate-x-0 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 space-y-8 h-full flex flex-col">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center group-hover:bg-sidebar-primary/90 transition-all duration-300 ease-out group-hover:scale-110">
              <BarChart3 className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-sidebar-foreground">BizTrackr</span>
          </Link>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-out ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:shadow-lg hover:-translate-y-1"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle & Logout */}
          <div className="space-y-2 border-t border-sidebar-border pt-4">
            <ThemeToggle />
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent gap-2 transition-all duration-300 ease-out"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
