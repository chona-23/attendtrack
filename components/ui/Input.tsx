"use client";

import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  admin?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, admin = false, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full rounded-xl border py-2.5 text-sm transition-all duration-150",
              "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100",
              "placeholder:text-slate-400 dark:placeholder:text-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/30",
              icon ? "pl-10" : "pl-3",
              className.includes("pr-") ? "" : "pr-3",
              error
                ? "border-rose-400 focus:ring-rose-400"
                : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ paddingLeft: icon ? "2.5rem" : undefined }}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
