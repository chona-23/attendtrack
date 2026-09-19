"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { format, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  Users,
  UserCheck,
  Coffee,
  UserX,
  Clock,
  TrendingUp,
  Activity,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { db } from "@/lib/firebase";
import { fetchAllIncidences } from "@/lib/incidences";

interface KPI {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

interface RecentEvent {
  id: string;
  userName: string;
  eventType: string;
  timestamp: { seconds: number };
}

const eventLabels: Record<string, string> = {
  clock_in: "Entrada",
  lunch_out: "Salida a Comida",
  lunch_in: "Regreso de Comida",
  clock_out: "Salida",
};

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLunch: 0,
    clockedOut: 0,
    pendingIncidences: 0,
  });
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");

      // 1. Get all users
      let userCount = 0;
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        userCount = usersSnap.size;
      } catch (userErr) {
        console.warn("Could not read users collection directly:", userErr);
      }

      // 2. Get today's attendance events (query without orderBy to avoid requiring composite indexes)
      const todayQ = query(
        collection(db, "attendance"),
        where("date", "==", today)
      );
      const todaySnap = await getDocs(todayQ);
      const todayEvents = todaySnap.docs
        .map((d) => ({ id: d.id, ...d.data() } as RecentEvent & { userId: string; date: string }))
        .sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0));

      // Group by user and find last event
      const userLastEvent = new Map<string, string>();
      for (const ev of todayEvents) {
        if (!userLastEvent.has(ev.userId)) {
          userLastEvent.set(ev.userId, ev.eventType);
        }
      }

      let presentToday = 0, onLunch = 0, clockedOut = 0;
      for (const [, lastEvent] of userLastEvent) {
        if (lastEvent === "clock_in" || lastEvent === "lunch_in") presentToday++;
        else if (lastEvent === "lunch_out") { onLunch++; presentToday++; }
        else if (lastEvent === "clock_out") clockedOut++;
      }

      const totalEmployees = Math.max(userCount, userLastEvent.size);

      // 3. Count pending incidences (all time)
      let pendingIncidences = 0;
      try {
        const allInc = await fetchAllIncidences("2020-01-01", today);
        pendingIncidences = allInc.filter((i) => i.status === "pending").length;
      } catch {}

      setKpis({ totalEmployees, presentToday, onLunch, clockedOut, pendingIncidences });
      setRecentEvents(todayEvents.slice(0, 10));
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const kpiCards: KPI[] = [
    {
      label: "Total de Empleados",
      value: kpis.totalEmployees,
      icon: <Users size={22} />,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50/80 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
    },
    {
      label: "Presentes Hoy",
      value: kpis.presentToday,
      icon: <UserCheck size={22} />,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
    },
    {
      label: "En Comida",
      value: kpis.onLunch,
      icon: <Coffee size={22} />,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50/80 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
    },
    {
      label: "Salida Registrada",
      value: kpis.clockedOut,
      icon: <UserX size={22} />,
      color: "text-slate-500 dark:text-slate-400",
      bg: "bg-slate-100 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20",
    },
    {
      label: "Incidencias Pendientes",
      value: kpis.pendingIncidences,
      icon: <AlertTriangle size={22} />,
      color: kpis.pendingIncidences > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-500",
      bg: kpis.pendingIncidences > 0
        ? "bg-amber-50/90 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/20"
        : "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700",
    },
  ];

  const isRefreshing = mounted ? loading : false;

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Panel de Administración</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5" suppressHydrationWarning>
              {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })} ·{" "}
              Última actualización {format(lastRefresh, "HH:mm")}
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={isRefreshing}
            suppressHydrationWarning
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {kpiCards.map((kpi) => (
            <div
              key={kpi.label}
              className={`rounded-2xl border p-5 shadow-xs transition-colors duration-200 ${kpi.bg}`}
            >
              <div className={`mb-3 ${kpi.color}`}>{kpi.icon}</div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{kpi.value}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Quick stats bar */}
        {kpis.totalEmployees > 0 && (
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tasa de Asistencia de Hoy</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.round(((kpis.presentToday + kpis.clockedOut) / kpis.totalEmployees) * 100))}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {kpis.presentToday + kpis.clockedOut} de {kpis.totalEmployees} empleados asistieron hoy
            </p>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-slate-500 dark:text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Actividad Reciente de Hoy
            </h2>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentEvents.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <p>Aún no hay actividad registrada hoy.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      {ev.userName?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{ev.userName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {eventLabels[ev.eventType] ?? ev.eventType}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {format(new Date(ev.timestamp.seconds * 1000), "HH:mm")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
