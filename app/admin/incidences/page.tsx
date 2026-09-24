"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock3,
  RefreshCw,
  User,
  Calendar,
  Plus,
  Trash2,
} from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import {
  subscribeToAllIncidences,
  updateBatchIncidenceStatus,
  INCIDENCE_LABELS,
  IncidenceRecord,
  IncidenceStatus,
} from "@/lib/incidences";
import {
  subscribeToHolidays,
  addHoliday,
  removeHoliday,
  HolidayRecord,
} from "@/lib/holidays";

const STATUS_TABS: { label: string; value: IncidenceStatus | "all" | "holidays" }[] = [
  { label: "Pendientes", value: "pending" },
  { label: "Todas", value: "all" },
  { label: "Aprobadas", value: "approved" },
  { label: "Rechazadas", value: "rejected" },
  { label: "Días Festivos 🌟", value: "holidays" },
];

const STATUS_CONFIG = {
  pending:  { icon: Clock3,       color: "text-amber-700 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30",    label: "Pendiente" },
  approved: { icon: CheckCircle2, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30", label: "Aprobada" },
  rejected: { icon: XCircle,      color: "text-rose-700 dark:text-rose-400",    bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30",       label: "Rechazada" },
};

export interface GroupedIncidencePeriod {
  groupId: string;
  ids: string[];
  userId: string;
  userName: string;
  userEmail: string;
  type: string;
  notes: string;
  status: IncidenceStatus;
  startDate: string;
  endDate: string;
  dayCount: number;
  extraHours?: number;
}

export default function AdminIncidencesPage() {
  const [incidences, setIncidences] = useState<IncidenceRecord[]>([]);
  const [holidays, setHolidays] = useState<HolidayRecord[]>([]);
  const [tab, setTab] = useState<IncidenceStatus | "all" | "holidays">("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Holiday form state
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [newHolidayDate, setNewHolidayDate] = useState(todayStr);
  const [newHolidayName, setNewHolidayName] = useState("");
  const [holidayAdding, setHolidayAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubInc = subscribeToAllIncidences((records) => {
      setIncidences(records);
      setLoading(false);
    });
    const unsubHol = subscribeToHolidays((hList) => {
      setHolidays(hList);
    });
    return () => {
      unsubInc();
      unsubHol();
    };
  }, []);

  // Group individual daily records into multi-day period requests
  const groupedPeriods = useMemo(() => {
    const map = new Map<string, GroupedIncidencePeriod>();

    for (const rec of incidences) {
      const sDate = rec.startDate || rec.date;
      const eDate = rec.endDate || rec.date;
      const key = `${rec.userId}_${rec.type}_${sDate}_${eDate}_${rec.notes || ""}`;

      if (!map.has(key)) {
        map.set(key, {
          groupId: key,
          ids: rec.id ? [rec.id] : [],
          userId: rec.userId,
          userName: rec.userName,
          userEmail: rec.userEmail,
          type: rec.type,
          notes: rec.notes,
          status: rec.status,
          startDate: sDate,
          endDate: eDate,
          dayCount: 1,
          extraHours: rec.extraHours,
        });
      } else {
        const item = map.get(key)!;
        if (rec.id && !item.ids.includes(rec.id)) {
          item.ids.push(rec.id);
        }
        if (rec.date < item.startDate) item.startDate = rec.date;
        if (rec.date > item.endDate) item.endDate = rec.date;
        item.dayCount = item.ids.length;

        // Status priority: if any document in period is pending -> group status is pending
        if (rec.status === "pending") {
          item.status = "pending";
        }
      }
    }

    return Array.from(map.values());
  }, [incidences]);

  const handleAction = async (ids: string[], status: IncidenceStatus, groupId: string) => {
    if (!ids || ids.length === 0) return;
    setActionLoading(groupId + status);
    try {
      await updateBatchIncidenceStatus(ids, status);
    } catch (err) {
      console.error("Failed to update incidence status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayName.trim()) return;
    setHolidayAdding(true);
    try {
      await addHoliday(newHolidayDate, newHolidayName);
      setNewHolidayName("");
    } catch (err) {
      console.error("Failed to add holiday:", err);
    } finally {
      setHolidayAdding(false);
    }
  };

  const handleRemoveHoliday = async (id: string) => {
    try {
      await removeHoliday(id);
    } catch (err) {
      console.error("Failed to remove holiday:", err);
    }
  };

  const filtered = tab === "all"
    ? groupedPeriods
    : tab === "holidays"
    ? []
    : groupedPeriods.filter((p) => p.status === tab);

  const pendingCount = groupedPeriods.filter((p) => p.status === "pending").length;

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Incidencias y Permisos</h1>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">
                  {pendingCount} solicitud{pendingCount !== 1 ? "es" : ""} pendiente{pendingCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Gestiona solicitudes de Vacaciones, Incapacidades, Permisos y Días Festivos
            </p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_TABS.map((t) => {
            const count = t.value === "all"
              ? groupedPeriods.length
              : t.value === "holidays"
              ? holidays.length
              : groupedPeriods.filter((p) => p.status === t.value).length;
            return (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={[
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border cursor-pointer",
                  tab === t.value
                    ? "bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100 border-slate-900 dark:border-slate-600 shadow-xs"
                    : "bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200",
                ].join(" ")}
              >
                {t.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${tab === t.value ? "bg-slate-700 dark:bg-slate-600 text-white dark:text-slate-200" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* HOLIDAYS TAB */}
        {tab === "holidays" ? (
          <div className="space-y-6">
            {/* Form to add a Holiday */}
            <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-amber-500" /> Configurar Nuevo Día Festivo
              </h3>
              <form onSubmit={handleAddHoliday} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="holiday-date" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Fecha del Día Festivo
                  </label>
                  <input
                    id="holiday-date"
                    type="date"
                    value={newHolidayDate}
                    onChange={(e) => setNewHolidayDate(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="holiday-name" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Nombre o Motivo del Festivo
                  </label>
                  <input
                    id="holiday-name"
                    type="text"
                    value={newHolidayName}
                    onChange={(e) => setNewHolidayName(e.target.value)}
                    placeholder="ej. Año Nuevo, Día del Trabajo, Navidad"
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={holidayAdding}
                    className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Plus size={15} />
                    {holidayAdding ? "Guardando…" : "Agregar Día Festivo"}
                  </button>
                </div>
              </form>
            </div>

            {/* List of Holidays */}
            <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Días Festivos Oficiales ({holidays.length})
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Los empleados no se marcarán como ausentes en estos días
                </span>
              </div>
              {holidays.length === 0 ? (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                  No hay días festivos configurados aún.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {holidays.map((h) => (
                    <li key={h.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                          🌟
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{h.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{h.date}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveHoliday(h.id!)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                        title="Eliminar festivo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          /* INCIDENCES LIST */
          loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <AlertTriangle size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No se encontraron incidencias en esta categoría.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((period) => {
                const cfg = STATUS_CONFIG[period.status];
                const StatusIcon = cfg.icon;
                const isPending = period.status === "pending";
                const isMultiDay = period.dayCount > 1 || (period.endDate && period.endDate !== period.startDate);

                return (
                  <div
                    key={period.groupId}
                    className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start gap-4 shadow-xs transition-colors duration-200"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
                      <User size={16} className="text-slate-600 dark:text-slate-300" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{period.userName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{period.userEmail}</p>
                        </div>
                        {/* Status badge */}
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon size={11} />
                          {cfg.label}
                        </span>
                      </div>

                      {/* Incidence type */}
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2 flex-wrap">
                        <span>{INCIDENCE_LABELS[period.type as keyof typeof INCIDENCE_LABELS] || period.type}</span>
                        {isMultiDay && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                            {period.dayCount} días
                          </span>
                        )}
                        {period.type === "extra_hours" && period.extraHours !== undefined && (
                          <span className="ml-2 text-blue-600 dark:text-blue-400 font-bold">{period.extraHours.toFixed(1)} hrs</span>
                        )}
                      </p>

                      {/* Notes */}
                      {period.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{period.notes}</p>
                      )}

                      {/* Date & time */}
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                        {isMultiDay ? (
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            Periodo: {period.startDate} al {period.endDate} ({period.dayCount} días)
                          </span>
                        ) : (
                          <span>Fecha: {period.startDate}</span>
                        )}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 shrink-0 self-end sm:self-center">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleAction(period.ids, "approved", period.groupId)}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                          >
                            {actionLoading === period.groupId + "approved" ? (
                              <span className="w-3 h-3 border border-emerald-600/40 border-t-emerald-600 rounded-full animate-spin" />
                            ) : (
                              <CheckCircle2 size={13} />
                            )}
                            {isMultiDay ? "Aprobar Periodo Completo" : "Aprobar"}
                          </button>
                          <button
                            onClick={() => handleAction(period.ids, "rejected", period.groupId)}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                          >
                            {actionLoading === period.groupId + "rejected" ? (
                              <span className="w-3 h-3 border border-rose-600/40 border-t-rose-600 rounded-full animate-spin" />
                            ) : (
                              <XCircle size={13} />
                            )}
                            {isMultiDay ? "Rechazar Periodo" : "Rechazar"}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleAction(period.ids, "pending", period.groupId)}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <RefreshCw size={12} />
                          Restablecer a Pendiente
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </AdminShell>
  );
}
