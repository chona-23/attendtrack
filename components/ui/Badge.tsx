"use client";

import React from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "muted" | "purple";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  danger:  "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
  info:    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
  muted:   "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700",
  purple:  "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30",
};

const dotStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-400",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger:  "bg-rose-500",
  info:    "bg-blue-500",
  muted:   "bg-slate-300",
  purple:  "bg-purple-500",
};

const sizeStyles: Record<"sm" | "md" | "lg", string> = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export function Badge({
  children,
  variant = "default",
  dot = false,
  size = "md",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        sizeStyles[size],
        variantStyles[variant],
        className,
      ].join(" ")}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotStyles[variant]}`}
        />
      )}
      {children}
    </span>
  );
}
