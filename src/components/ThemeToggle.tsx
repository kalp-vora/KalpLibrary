"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = true }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Daylight" : "Switch to Night"}
      title={isDark ? "Switch to Daylight" : "Switch to Night"}
      className={`p-2 sm:px-3 rounded-xl border flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95 bg-surface-card text-brand-secondary border-theme-border hover:border-brand-secondary/60 ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-brand-primary" />
          {showLabel && <span className="hidden sm:inline text-[11px] text-text-muted">Daylight</span>}
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-brand-secondary" />
          {showLabel && <span className="hidden sm:inline text-[11px] text-text-muted">Night</span>}
        </>
      )}
    </button>
  );
}

