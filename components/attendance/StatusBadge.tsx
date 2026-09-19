"use client";

import React from "react";
import { AttendanceStatus } from "@/lib/attendance";

const statusConfig: Record<
  AttendanceStatus,
  { label: string; color: string; dot: string; bg: string }
> = {
  idle: {
    label: "Sin registrar",
    color: "text-slate-500",
    dot: "bg-slate-400",
    bg: "bg-slate-100",
  },
  clocked_in: {
    label: "Entrada registrada",
    color: "text-emerald-700",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
  },
  on_lunch: {
    label: "En receso de comida",
    color: "text-amber-700",
    dot: "bg-amber-500",
    bg: "bg-amber-50",
  },
  clocked_out: {
    label: "Salida registrada",
    color: "text-slate-500",
    dot: "bg-slate-400",
    bg: "bg-slate-100",
  },
};

interface StatusBadgeProps {
  status: AttendanceStatus;
  large?: boolean;
}

export function StatusBadge({ status, large = false }: StatusBadgeProps) {
  const cfg = statusConfig[status];
  const isLive = status === "clocked_in" || status === "on_lunch";

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full font-medium border",
        large ? "px-4 py-2 text-sm" : "px-3 py-1 text-xs",
        cfg.bg,
        cfg.color,
        status === "clocked_in" ? "border-emerald-200" : "border-slate-200",
        status === "on_lunch" ? "border-amber-200" : "",
      ].join(" ")}
    >
      <span
        className={[
          "rounded-full flex-shrink-0",
          large ? "w-2.5 h-2.5" : "w-2 h-2",
          cfg.dot,
          isLive ? "status-dot-live" : "",
        ].join(" ")}
      />
      {cfg.label}
    </span>
  );
}
