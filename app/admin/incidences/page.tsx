"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock3,
  Filter,
  RefreshCw,
  User,
} from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import {
  subscribeToAllIncidences,
  updateIncidenceStatus,
  INCIDENCE_LABELS,
  IncidenceRecord,
  IncidenceStatus,
} from "@/lib/incidences";

const STATUS_TABS: { label: string; value: IncidenceStatus | "all" }[] = [
  { label: "Todas", value: "all" },
  { label: "Pendientes", value: "pending" },
  { label: "Aprobadas", value: "approved" },
  { label: "Rechazadas", value: "rejected" },
];

const STATUS_CONFIG = {
  pending:  { icon: Clock3,       color: "text-amber-700 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30",    label: "Pendiente" },
  approved: { icon: CheckCircle2, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30", label: "Aprobada" },
  rejected: { icon: XCircle,      color: "text-rose-700 dark:text-rose-400",    bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30",       label: "Rechazada" },
};

export default function AdminIncidencesPage() {
  const [incidences, setIncidences] = useState<IncidenceRecord[]>([]);
  const [tab, setTab] = useState<IncidenceStatus | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToAllIncidences((records) => {
      setIncidences(records);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleAction = async (id: string, status: IncidenceStatus) => {
    if (!id) return;
    setActionLoading(id + status);
    try {
      await updateIncidenceStatus(id, status);
    } catch (err) {
      console.error("Failed to update incidence status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = tab === "all" ? incidences : incidences.filter((i) => i.status === tab);

  const pendingCount = incidences.filter((i) => i.status === "pending").length;

  const emptyMessages: Record<string, string> = {
    all: "No se encontraron incidencias.",
    pending: "No hay incidencias pendientes.",
    approved: "No hay incidencias aprobadas.",
    rejected: "No hay incidencias rechazadas.",
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Incidencias</h1>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">
                  {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Revisa y gestiona las solicitudes de incidencias enviadas por los empleados
            </p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_TABS.map((t) => {
            const count = t.value === "all"
              ? incidences.length
              : incidences.filter((i) => i.status === t.value).length;
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

        {/* Incidence cards */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <AlertTriangle size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">{emptyMessages[tab] ?? "No se encontraron incidencias."}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((inc) => {
              const cfg = STATUS_CONFIG[inc.status];
              const StatusIcon = cfg.icon;
              const isPending = inc.status === "pending";
              return (
                <div
                  key={inc.id}
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
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{inc.userName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{inc.userEmail}</p>
                      </div>
                      {/* Status badge */}
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon size={11} />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Incidence type */}
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                      {INCIDENCE_LABELS[inc.type]}
                      {inc.type === "extra_hours" && inc.extraHours !== undefined && (
                        <span className="ml-2 text-blue-600 dark:text-blue-400 font-bold">{inc.extraHours.toFixed(1)} hrs</span>
                      )}
                    </p>

                    {/* Notes */}
                    {inc.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{inc.notes}</p>
                    )}

                    {/* Date & time */}
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                      {inc.date} · {inc.timestamp?.seconds ? format(new Date(inc.timestamp.seconds * 1000), "HH:mm") : "—"}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 shrink-0 self-end sm:self-center">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleAction(inc.id!, "approved")}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                        >
                          {actionLoading === inc.id + "approved" ? (
                            <span className="w-3 h-3 border border-emerald-600/40 border-t-emerald-600 rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleAction(inc.id!, "rejected")}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                        >
                          {actionLoading === inc.id + "rejected" ? (
                            <span className="w-3 h-3 border border-rose-600/40 border-t-rose-600 rounded-full animate-spin" />
                          ) : (
                            <XCircle size={13} />
                          )}
                          Rechazar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleAction(inc.id!, "pending")}
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
        )}
      </div>
    </AdminShell>
  );
}
