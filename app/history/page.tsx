"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from "date-fns";
import { ChevronLeft, ChevronRight, LogIn, Coffee, ArrowLeftRight, LogOut, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { subscribeToUserHistory, AttendanceEvent, deriveStatus, getLocalDateString } from "@/lib/attendance";
import { minutesToHHMM } from "@/lib/reports";

const eventIcons: Record<string, React.ReactNode> = {
  clock_in:  <LogIn size={14} className="text-emerald-500" />,
  lunch_out: <Coffee size={14} className="text-amber-500" />,
  lunch_in:  <ArrowLeftRight size={14} className="text-blue-500" />,
  clock_out: <LogOut size={14} className="text-rose-500" />,
};

const eventLabels: Record<string, string> = {
  clock_in:  "Entrada",
  lunch_out: "Salida Comida",
  lunch_in:  "Regreso Comida",
  clock_out: "Salida",
};

export default function HistoryPage() {
  const { user, loading: authLoading, is2FAVerified, needs2FASetup } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }
    if (needs2FASetup) { router.replace("/setup-2fa"); return; }
    if (!is2FAVerified) { router.replace("/verify-2fa"); return; }
  }, [user, authLoading, is2FAVerified, needs2FASetup, router]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserHistory(user.uid, (e) => {
      setEvents(e);
      setLoading(false);
    }, 200);
    return unsub;
  }, [user]);

  // Group events by date
  const byDate = events.reduce((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {} as Record<string, AttendanceEvent[]>);

  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));
  const todayStr = getLocalDateString();

  if (authLoading || !user) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20 min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Historial de Asistencia</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Tus registros recientes de asistencia</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 skeleton rounded-xl" />
            ))}
          </div>
        ) : sortedDates.length === 0 ? (
          <Card className="text-center py-12 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <Clock size={40} className="text-slate-400 dark:text-slate-500 mx-auto mb-3" />
            <p className="text-slate-700 dark:text-slate-300 font-semibold">Aún no hay registros de asistencia</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Comienza registrando tu entrada desde el inicio</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedDates.map((date) => {
              const dayEvents = byDate[date].sort(
                (a, b) => a.timestamp.seconds - b.timestamp.seconds
              );
              let status = deriveStatus(dayEvents);
              const isPastDay = date < todayStr;
              if (isPastDay && (status === "clocked_in" || status === "on_lunch")) {
                status = "unconfirmed_out" as any;
              }

              const clockIn = dayEvents.find((e) => e.eventType === "clock_in");
              const clockOut = dayEvents.find((e) => e.eventType === "clock_out");
              let workedMinutes = 0;
              if (clockIn && clockOut) {
                workedMinutes = Math.round(
                  (clockOut.timestamp.seconds - clockIn.timestamp.seconds) / 60
                );
              }

              return (
                <Card key={date} padding="md" className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {format(parseISO(date), "EEEE, d 'de' MMMM")}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{format(parseISO(date), "yyyy")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {workedMinutes > 0 && (
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                          {minutesToHHMM(workedMinutes)}
                        </span>
                      )}
                      <Badge
                        variant={
                          status === "clocked_out" ? "success" :
                          status === "clocked_in" ? "info" :
                          (status as string) === "unconfirmed_out" ? "warning" :
                          status === "on_lunch" ? "warning" : "muted"
                        }
                      >
                        {status === "clocked_out" ? "Completo" :
                         status === "clocked_in" ? "En Curso" :
                         (status as string) === "unconfirmed_out" ? "Salida no confirmada" :
                         status === "on_lunch" ? "En Comida" : "Incompleto"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs"
                      >
                        {eventIcons[ev.eventType]}
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {eventLabels[ev.eventType]}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono">
                          {format(new Date(ev.timestamp.seconds * 1000), "HH:mm")}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
