"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`flex h-8 w-16 items-center rounded-full bg-subtle p-1 border border-hairline ${className}`}
        aria-hidden="true"
      >
        <span className="h-6 w-6 rounded-full bg-surface" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div
      role="radiogroup"
      aria-label="Color scheme preference"
      className={`relative flex h-8 items-center rounded-full bg-subtle p-0.5 border border-hairline transition-colors ${className}`}
    >
      {/* Light Option */}
      <button
        type="button"
        role="radio"
        aria-checked={!isDark}
        aria-label="Switch to light theme"
        onClick={() => setTheme("light")}
        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-sapphire ${
          !isDark ? "text-ink font-medium" : "text-faint hover:text-muted"
        }`}
      >
        <Sun className="h-3.5 w-3.5" />
      </button>

      {/* Dark Option */}
      <button
        type="button"
        role="radio"
        aria-checked={isDark}
        aria-label="Switch to dark theme"
        onClick={() => setTheme("dark")}
        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-sapphire ${
          isDark ? "text-ink font-medium" : "text-faint hover:text-muted"
        }`}
      >
        <Moon className="h-3.5 w-3.5" />
      </button>

      {/* Animated Slider Pill */}
      <motion.div
        layout={!shouldReduceMotion}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="absolute top-0.5 bottom-0.5 w-7 rounded-full bg-surface shadow-subtle border border-hairline"
        style={{
          left: isDark ? "calc(100% - 1.85rem)" : "2px",
        }}
        aria-hidden="true"
      />
    </div>
  );
}

export default ThemeToggle;

