"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <div className="fixed bottom-16 right-4 md:bottom-5 md:right-5 z-50 select-none animate-fade-in">
      <button
        onClick={toggleTheme}
        type="button"
        id="theme-toggle-btn"
        aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        className={[
          "group relative flex items-center p-1 rounded-full border transition-all duration-300 shadow-lg cursor-pointer",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          isDark
            ? "bg-slate-900/90 border-slate-700/90 text-slate-200 hover:bg-slate-800 shadow-slate-950/60 backdrop-blur-md"
            : "bg-white/95 border-slate-300 text-slate-800 hover:bg-slate-50 shadow-slate-400/30 backdrop-blur-md",
        ].join(" ")}
      >
        {/* Sliding active background indicator */}
        <div
          className={[
            "absolute top-1 bottom-1 w-8 h-8 rounded-full transition-transform duration-300 ease-out shadow-sm flex items-center justify-center pointer-events-none",
            isDark
              ? "left-1 translate-x-0 bg-indigo-600/30 border border-indigo-500/50"
              : "left-1 translate-x-8 bg-amber-400/20 border border-amber-500/40",
          ].join(" ")}
        />

        {/* Moon Icon Container */}
        <div
          className={[
            "relative z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200",
            isDark ? "text-indigo-400 font-bold" : "text-slate-400 group-hover:text-slate-600",
          ].join(" ")}
        >
          <Moon size={16} className={isDark ? "fill-indigo-400/30" : ""} />
        </div>

        {/* Sun Icon Container */}
        <div
          className={[
            "relative z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200",
            !isDark ? "text-amber-500 font-bold" : "text-slate-500 group-hover:text-slate-300",
          ].join(" ")}
        >
          <Sun size={17} className={!isDark ? "fill-amber-400 text-amber-500" : ""} />
        </div>
      </button>
    </div>
  );
}
