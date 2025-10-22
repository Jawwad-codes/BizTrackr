/** @format */

"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={`w-full justify-start gap-2 transition-all duration-500 ease-in-out transform hover:scale-105 ${
        theme === "dark"
          ? "text-white hover:bg-gray-800 hover:text-white"
          : "text-black hover:bg-gray-200 hover:text-black"
      }`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <div className="relative w-4 h-4 overflow-hidden">
        <Sun
          className={`w-4 h-4 absolute transition-all duration-500 ease-in-out ${
            theme === "dark"
              ? "translate-y-0 rotate-0 opacity-100 text-orange-500"
              : "translate-y-6 rotate-180 opacity-0"
          }`}
        />
        <Moon
          className={`w-4 h-4 absolute transition-all duration-500 ease-in-out ${
            theme === "light"
              ? "translate-y-0 rotate-0 opacity-100 text-orange-500"
              : "-translate-y-6 -rotate-180 opacity-0"
          }`}
        />
      </div>
      <span className="transition-all duration-300">
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </span>
    </Button>
  );
}
