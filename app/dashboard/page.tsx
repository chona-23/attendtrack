"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar, AlertTriangle, Plus, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/layout/AppShell";
import { ActionPanel } from "@/components/attendance/ActionPanel";
import { StatusBadge } from "@/components/attendance/StatusBadge";
import { useAttendanceStatus } from "@/hooks/useAttendanceStatus";
import {
  recordIncidence,
  subscribeToUserIncidences,
  INCIDENCE_LABELS,
  IncidenceType,
  IncidenceRecord,
  IncidenceStatus,
} from "@/lib/incidences";

const INCIDENCE_TYPES: IncidenceType[] = [
  "vacation",
  "medical_leave",
  "late_arrival_approved",
  "early_departure_approved",
  "extra_hours",
  "childcare",
  "medical",
  "emergency",
  "other",
];

const STATUS_CONFIG = {
  pending: { icon: Clock3, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30", label: "Pendiente" },
  approved: { icon: CheckCircle2, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30", label: "Aprobada" },
  rejected: { icon: XCircle, color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30", label: "Rechazada" },
};

export default function DashboardPage() {
  const { user, loading, is2FAVerified, needs2FASetup, profile } = useAuth();
  const router = useRouter();
  const { status } = useAttendanceStatus();
  const [now, setNow] = useState<Date>(new Date());

  // Incidences state
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [incidences, setIncidences] = useState<IncidenceRecord[]>([]);
  const [incType, setIncType] = useState<IncidenceType>("vacation");
  const [incStartDate, setIncStartDate] = useState(todayStr);
  const [incEndDate, setIncEndDate] = useState(todayStr);
  const [incNotes, setIncNotes] = useState("");
  const [incExtraHours, setIncExtraHours] = useState(1);
  const [incSubmitting, setIncSubmitting] = useState(false);
  const [incSuccess, setIncSuccess] = useState(false);
  const [incError, setIncError] = useState("");

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (needs2FASetup) { router.replace("/setup-2fa"); return; }
    if (!is2FAVerified) { router.replace("/verify-2fa"); return; }
  }, [user, loading, is2FAVerified, needs2FASetup, router]);

  // Subscribe to user incidences
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserIncidences(user.uid, (records) => {
      setIncidences(records);
    });
    return unsub;
  }, [user]);

  // Group user incidences into period requests for clean single-item display
  const groupedUserPeriods = useMemo(() => {
    const map = new Map<string, {
      groupId: string;
      type: IncidenceType;
      notes: string;
      status: IncidenceStatus;
      startDate: string;
      endDate: string;
      dayCount: number;
      timestamp: any;
      extraHours?: number;
    }>();

    for (const rec of incidences) {
      const sDate = rec.startDate || rec.date;
      const eDate = rec.endDate || rec.date;
      const key = `${rec.userId}_${rec.type}_${sDate}_${eDate}_${rec.notes || ""}`;

      if (!map.has(key)) {
        map.set(key, {
          groupId: key,
          type: rec.type,
          notes: rec.notes,
          status: rec.status,
          startDate: sDate,
          endDate: eDate,
          dayCount: 1,
          timestamp: rec.timestamp,
          extraHours: rec.extraHours,
        });
      } else {
        const item = map.get(key)!;
        if (rec.date < item.startDate) item.startDate = rec.date;
        if (rec.date > item.endDate) item.endDate = rec.date;
        item.dayCount++;
        if (rec.status === "pending") {
          item.status = "pending";
        }
      }
    }

    return Array.from(map.values());
  }, [incidences]);

  const handleIncidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if ((incType === "vacation" || incType === "medical_leave") && incEndDate < incStartDate) {
      setIncError("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    setIncSubmitting(true);
    setIncSuccess(false);
    setIncError("");

    try {
      await recordIncidence(
        user.uid,
        user.email || "",
        profile?.displayName || user.email?.split("@")[0] || "Empleado",
        incType,
        incNotes,
        (incType === "vacation" || incType === "medical_leave") ? incStartDate : undefined,
        incType === "extra_hours" ? incExtraHours : undefined,
        (incType === "vacation" || incType === "medical_leave") ? incEndDate : undefined
      );

      setIncNotes("");
      setIncSuccess(true);
      setTimeout(() => setIncSuccess(false), 4000);
    } catch (err: unknown) {
      console.error("Incidence submission error:", err);
      setIncError("Error al enviar la incidencia. Intente nuevamente.");
    } finally {
      setIncSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const greeting =
    now.getHours() < 12 ? "Buenos días" : now.getHours() < 17 ? "Buenas tardes" : "Buenas noches";

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {greeting}, {profile?.displayName?.split(" ")[0] ?? ""} 👋
            </h1>
            {/* Bold, styled date text */}
            <div className="flex items-center gap-2 mt-2">
              <Calendar size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <p className="text-blue-700 dark:text-blue-400 font-bold text-base sm:text-lg tracking-wide">
                {format(now, "EEEE, d 'de' MMMM 'de' yyyy")}
              </p>
            </div>
          </div>
          <div className="self-center sm:self-start">
            <StatusBadge status={status} large />
          </div>
        </div>

        {/* Current time card */}
        <div className="bg-gradient-to-br from-[#1e293b] via-[#24334a] to-[#0f172a] rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-slate-700/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                  Hora Actual
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl sm:text-6xl font-extrabold font-mono tracking-wider text-white" id="current-time">
                  {format(now, "HH:mm")}
                </p>
                <span className="text-base sm:text-lg font-mono font-semibold text-slate-400">
                  {format(now, ":ss")}
                </span>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-700/80 pt-3 sm:pt-0">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Hoy
              </span>
              <p className="text-sm sm:text-base font-bold text-slate-200 mt-0.5">
                {format(now, "eeee · d 'de' MMMM")}
              </p>
            </div>
          </div>
        </div>

        {/* Action panel */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
              Acciones de Asistencia
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Selecciona una acción para registrar tu estado
            </span>
          </div>
          <ActionPanel />
        </div>

        {/* ── Incidences Section ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
              Incidencias
            </h2>
          </div>

          {/* Submit form */}
          <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs transition-colors duration-200">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Registrar una Incidencia o Solicitud</h3>
            <form onSubmit={handleIncidenceSubmit} className="flex flex-col gap-3" id="incidence-form">
              {/* Type selector */}
              <div className="flex flex-col gap-1">
                <label htmlFor="incidence-type" className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Tipo de Incidencia
                </label>
                <select
                  id="incidence-type"
                  value={incType}
                  onChange={(e) => setIncType(e.target.value as IncidenceType)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                >
                  {INCIDENCE_TYPES.map((t) => (
                    <option key={t} value={t}>{INCIDENCE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Selector — for Vacaciones and Incapacidad Médica */}
              {(incType === "vacation" || incType === "medical_leave") && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="inc-start-date" className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                      Fecha de Inicio
                    </label>
                    <input
                      id="inc-start-date"
                      type="date"
                      value={incStartDate}
                      onChange={(e) => {
                        setIncStartDate(e.target.value);
                        if (incEndDate < e.target.value) setIncEndDate(e.target.value);
                      }}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="inc-end-date" className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                      Fecha de Fin
                    </label>
                    <input
                      id="inc-end-date"
                      type="date"
                      min={incStartDate}
                      value={incEndDate}
                      onChange={(e) => setIncEndDate(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Extra Hours Slider — only shown for extra_hours type */}
              {incType === "extra_hours" && (() => {
                const MIN = 0.5, MAX = 12, STEP = 0.5;
                const ticks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                const pct = (v: number) => ((v - MIN) / (MAX - MIN)) * 100;
                return (
                  <div className="flex flex-col gap-2">
                    <label htmlFor="extra-hours-slider" className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Horas Extra Trabajadas
                    </label>
                    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 pt-3 pb-4 flex flex-col gap-3">

                      {/* Value display + ± buttons */}
                      <div className="flex items-center justify-center gap-4">
                        <button
                          type="button"
                          aria-label="Disminuir 0.5"
                          onClick={() => setIncExtraHours((h) => Math.max(MIN, +(h - STEP).toFixed(1)))}
                          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition select-none cursor-pointer"
                        >−</button>

                        <div className="flex items-baseline gap-1">
                          <input
                            id="extra-hours-value"
                            type="number"
                            min={MIN}
                            max={MAX}
                            step={STEP}
                            value={incExtraHours}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              if (!isNaN(v)) setIncExtraHours(Math.min(MAX, Math.max(MIN, +v.toFixed(1))));
                            }}
                            className="w-16 text-center text-3xl font-extrabold text-blue-600 dark:text-blue-400 bg-transparent border-none outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-base font-semibold text-slate-500 dark:text-slate-400">hrs</span>
                        </div>

                        <button
                          type="button"
                          aria-label="Aumentar 0.5"
                          onClick={() => setIncExtraHours((h) => Math.min(MAX, +(h + STEP).toFixed(1)))}
                          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition select-none cursor-pointer"
                        >+</button>
                      </div>

                      {/* Slider */}
                      <input
                        id="extra-hours-slider"
                        type="range"
                        min={MIN}
                        max={MAX}
                        step={STEP}
                        value={incExtraHours}
                        onChange={(e) => setIncExtraHours(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-600"
                      />

                      {/* Tick marks */}
                      <div className="relative h-5 select-none">
                        {ticks.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setIncExtraHours(v)}
                            style={{ left: `${pct(v)}%`, transform: "translateX(-50%)" }}
                            className={`absolute top-0 text-xs transition-colors cursor-pointer ${incExtraHours === v
                                ? "text-blue-600 dark:text-blue-400 font-bold"
                                : "text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                              }`}
                          >
                            {v}h
                          </button>
                        ))}
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* Notes */}
              <div className="flex flex-col gap-1">
                <label htmlFor="incidence-notes" className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Notas / Detalles <span className="text-slate-400 dark:text-slate-500 normal-case">(opcional)</span>
                </label>
                <textarea
                  id="incidence-notes"
                  value={incNotes}
                  onChange={(e) => setIncNotes(e.target.value)}
                  placeholder="Agrega cualquier detalle relevante, ej. cita médica a las 10am, gerente notificado..."
                  rows={3}
                  maxLength={500}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 self-end">{incNotes.length}/500</span>
              </div>

              {/* Status messages */}
              {incSuccess && (
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl px-3 py-2">
                  <CheckCircle2 size={15} />
                  Incidencia enviada correctamente.
                </div>
              )}
              {incError && (
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-sm bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl px-3 py-2">
                  <XCircle size={15} />
                  {incError}
                </div>
              )}

              <button
                id="submit-incidence"
                type="submit"
                disabled={incSubmitting}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                {incSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus size={15} />
                )}
                {incSubmitting ? "Enviando…" : "Enviar Incidencia"}
              </button>
            </form>
          </div>

          {/* Incidences list */}
          {groupedUserPeriods.length > 0 && (
            <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Tus Incidencias ({groupedUserPeriods.length})
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Solicitudes consolidadas por periodo
                </span>
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-72 overflow-y-auto">
                {groupedUserPeriods.map((period) => {
                  const cfg = STATUS_CONFIG[period.status];
                  const Icon = cfg.icon;
                  const isMultiDay = period.dayCount > 1 || (period.endDate && period.endDate !== period.startDate);

                  return (
                    <li key={period.groupId} className="px-5 py-3 flex flex-col gap-1 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {INCIDENCE_LABELS[period.type]}
                          </span>
                          {isMultiDay && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                              {period.dayCount} días
                            </span>
                          )}
                          {period.type === "extra_hours" && period.extraHours !== undefined && (
                            <span className="ml-2 text-blue-600 dark:text-blue-400 font-bold">{period.extraHours.toFixed(1)} hrs</span>
                          )}
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          <Icon size={11} />
                          {cfg.label}
                        </div>
                      </div>
                      {period.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{period.notes}</p>
                      )}
                      <span className="text-xs text-slate-500 dark:text-slate-500">
                        {isMultiDay ? (
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            Periodo: {period.startDate} al {period.endDate} ({period.dayCount} días)
                          </span>
                        ) : (
                          <span>Fecha: {period.startDate}</span>
                        )}
                        {period.timestamp?.seconds && (
                          <span className="ml-2">· {format(new Date(period.timestamp.seconds * 1000), "HH:mm")}</span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        {/* ── End Incidences ───────────────────────────────────────────────────── */}

      </div>
    </AppShell>
  );
}
