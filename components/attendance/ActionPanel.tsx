"use client";

import React, { useState } from "react";
import {
  LogIn,
  Coffee,
  ArrowLeftRight,
  LogOut,
  CheckCircle2,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAttendanceStatus } from "@/hooks/useAttendanceStatus";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { recordAttendanceEvent, AttendanceEventType } from "@/lib/attendance";
import { useAuth } from "@/lib/auth-context";
import { format } from "date-fns";

interface ActionButton {
  label: string;
  eventType: AttendanceEventType;
  variant: "success" | "warning" | "danger" | "primary";
  icon: React.ReactNode;
  activeStatuses: string[];
  description: string;
}

const ACTION_BUTTONS: ActionButton[] = [
  {
    label: "Entrada",
    eventType: "clock_in",
    variant: "success",
    icon: <LogIn size={22} />,
    activeStatuses: ["idle"],
    description: "Iniciar jornada laboral",
  },
  {
    label: "Salida Comida",
    eventType: "lunch_out",
    variant: "warning",
    icon: <Coffee size={22} />,
    activeStatuses: ["clocked_in"],
    description: "Tomar descanso de comida",
  },
  {
    label: "Regreso Comida",
    eventType: "lunch_in",
    variant: "primary",
    icon: <ArrowLeftRight size={22} />,
    activeStatuses: ["on_lunch"],
    description: "Regresar de la comida",
  },
  {
    label: "Salida",
    eventType: "clock_out",
    variant: "danger",
    icon: <LogOut size={22} />,
    activeStatuses: ["clocked_in"],
    description: "Finalizar jornada laboral",
  },
];

export function ActionPanel() {
  const { user, profile } = useAuth();
  const { status, todayEvents, loading } = useAttendanceStatus();
  const isOnline = useOnlineStatus();
  const [loadingEvent, setLoadingEvent] = useState<AttendanceEventType | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleAction = async (eventType: AttendanceEventType) => {
    if (!user || !profile) return;

    setLoadingEvent(eventType);
    try {
      await recordAttendanceEvent(
        user.uid,
        profile.email,
        profile.displayName,
        eventType
      );
      const label = ACTION_BUTTONS.find((b) => b.eventType === eventType)?.label ?? "";
      setLastAction(`${label} registrado a las ${format(new Date(), "HH:mm")}`);
      setTimeout(() => setLastAction(null), 4000);
    } catch (err) {
      console.error("Failed to record event:", err);
    } finally {
      setLoadingEvent(null);
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-48 skeleton rounded-lg" />
      </Card>
    );
  }

  const isComplete = status === "clocked_out";

  const eventTypeMap: Record<string, string> = {
    clock_in: "Entrada",
    lunch_out: "Salida Comida",
    lunch_in: "Regreso Comida",
    clock_out: "Salida",
  };

  return (
    <div className="space-y-4">
      {/* Offline banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
          <WifiOff size={16} className="flex-shrink-0" />
          <span>
            <strong>Modo sin conexión</strong> — Las acciones se guardan localmente y se sincronizarán al reconectarte.
          </span>
        </div>
      )}

      {/* Success flash */}
      {lastAction && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm animate-fade-in">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          {lastAction}
        </div>
      )}

      {/* Completed state */}
      {isComplete ? (
        <Card padding="lg" className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h3 className="font-semibold text-slate-800 text-lg mb-1">Jornada Completada</h3>
          <p className="text-slate-500 text-sm">
            Has registrado tu salida por hoy. ¡Gran trabajo! 🎉
          </p>
        </Card>
      ) : (
        <Card padding="lg">
          <div className="grid grid-cols-2 gap-3">
            {ACTION_BUTTONS.map((btn) => {
              const isActive = btn.activeStatuses.includes(status);
              const isLoading = loadingEvent === btn.eventType;

              return (
                <button
                  key={btn.eventType}
                  id={`btn-${btn.eventType}`}
                  disabled={!isActive || !!loadingEvent}
                  onClick={() => handleAction(btn.eventType)}
                  className={[
                    "relative flex flex-col items-center justify-center gap-2",
                    "rounded-2xl p-5 transition-all duration-200 select-none",
                    "border-2 focus:outline-none focus:ring-2 focus:ring-offset-2",
                    isActive && !loadingEvent
                      ? btn.variant === "success"
                        ? "bg-emerald-500 border-emerald-400 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.97] cursor-pointer focus:ring-emerald-400"
                        : btn.variant === "warning"
                        ? "bg-amber-500 border-amber-400 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.97] cursor-pointer focus:ring-amber-400"
                        : btn.variant === "danger"
                        ? "bg-rose-500 border-rose-400 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.97] cursor-pointer focus:ring-rose-400"
                        : "bg-blue-600 border-blue-500 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.97] cursor-pointer focus:ring-blue-400"
                      : "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed",
                  ].join(" ")}
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  ) : (
                    btn.icon
                  )}
                  <span className="font-semibold text-sm">{btn.label}</span>
                  <span
                    className={`text-xs leading-tight text-center ${
                      isActive ? "opacity-75" : "opacity-0"
                    }`}
                  >
                    {btn.description}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Today's events mini-timeline */}
      {todayEvents.length > 0 && (
        <div className="text-xs text-slate-500 px-1">
          <p className="font-medium text-slate-600 mb-2">Actividad de hoy</p>
          <div className="flex flex-wrap gap-2">
            {todayEvents.map((event) => (
              <span
                key={event.id}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-full"
              >
                {eventTypeMap[event.eventType] || event.eventType} ·{" "}
                {format(new Date(event.timestamp.seconds * 1000), "HH:mm")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
