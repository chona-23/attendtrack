"use client";

import React from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "success" | "warning" | "danger" | "ghost" | "outline";
type Size = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[#1e293b] text-white hover:bg-[#0f172a] active:scale-[0.98] shadow-md hover:shadow-lg",
  secondary:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.98]",
  success:
    "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98] shadow-md shadow-emerald-500/25",
  warning:
    "bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.98] shadow-md shadow-amber-500/25",
  danger:
    "bg-rose-500 text-white hover:bg-rose-600 active:scale-[0.98] shadow-md shadow-rose-500/25",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 active:scale-[0.98]",
  outline:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.98]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-base gap-2",
  xl: "px-6 py-4 text-lg gap-3",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center font-medium rounded-xl",
        "transition-all duration-150 select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : "",
        isDisabled ? "opacity-50 cursor-not-allowed active:scale-100 pointer-events-none" : "cursor-pointer",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === "xl" ? 20 : size === "lg" ? 18 : 16} />
      ) : (
        icon && iconPosition === "left" && <span className="flex-shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === "right" && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  );
}
