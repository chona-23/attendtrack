"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  admin?: boolean;
}

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  admin = false,
}: CardProps) {
  return (
    <div
      className={[
        admin ? "admin-card" : "card",
        paddingStyles[padding],
        hover ? "cursor-pointer transition-transform hover:-translate-y-0.5" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  admin = false,
}: {
  children: React.ReactNode;
  className?: string;
  admin?: boolean;
}) {
  return (
    <h3
      className={[
        "font-semibold text-base",
        admin ? "text-slate-100" : "text-slate-800",
        className,
      ].join(" ")}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
  admin = false,
}: {
  children: React.ReactNode;
  className?: string;
  admin?: boolean;
}) {
  return (
    <p
      className={[
        "text-sm mt-0.5",
        admin ? "text-slate-400" : "text-slate-500",
        className,
      ].join(" ")}
    >
      {children}
    </p>
  );
}
