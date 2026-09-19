"use client";

import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  Search,
  FileText,
  LogIn,
  Coffee,
  ArrowLeftRight,
  LogOut,
  ChevronDown,
  ChevronUp,
  Users,
  Clock,
  Calendar,
  Layers,
  ListFilter,
} from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { Badge } from "@/components/ui/Badge";
import { subscribeToAllRecords, AttendanceEvent, getLocalDateString } from "@/lib/attendance";

const eventConfig: Record<
  string,
  { label: string; icon: React.ReactNode; variant: "success" | "warning" | "info" | "danger" | "muted" }
> = {
  clock_in:  { label: "Entrada",           icon: <LogIn size={12} />,          variant: "success" },
  lunch_out: { label: "Salida a Comida",   icon: <Coffee size={12} />,         variant: "warning" },
  lunch_in:  { label: "Regreso de Comida", icon: <ArrowLeftRight size={12} />, variant: "info" },
  clock_out: { label: "Salida",            icon: <LogOut size={12} />,         variant: "danger" },
};

interface UserRecordGroup {
  userId: string;
  userName: string;
  userEmail: string;
  latestEvent: AttendanceEvent | null;
  firstClockIn: AttendanceEvent | null;
  status: "clocked_in" | "on_lunch" | "clocked_out" | "idle";
  statusLabel: string;
  statusVariant: "success" | "warning" | "muted" | "info";
  events: AttendanceEvent[];
}

export default function AdminRecordsPage() {
  const [records, setRecords] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [viewMode, setViewMode] = useState<"grouped" | "stream">("grouped");
  const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToAllRecords(startDate, endDate, (evs) => {
      setRecords(evs);
      setLoading(false);
    });
    return unsub;
  }, [startDate, endDate]);

  const toggleExpand = (userId: string) => {
    setExpandedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const expandAll = (userGroupKeys: string[]) => {
    setExpandedUserIds(new Set(userGroupKeys));
  };

  const collapseAll = () => {
    setExpandedUserIds(new Set());
  };

  // Filter raw records
  const filteredRecords = records.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      r.userName?.toLowerCase().includes(q) ||
      r.userEmail?.toLowerCase().includes(q);
    const matchType = !filterType || r.eventType === filterType;
    return matchSearch && matchType;
  });

  // Aggregate events by User for grouped view
  const userGroupsMap = new Map<string, UserRecordGroup>();

  for (const record of filteredRecords) {
    const uid = record.userId;
    if (!userGroupsMap.has(uid)) {
      userGroupsMap.set(uid, {
        userId: uid,
        userName: record.userName || "Empleado Desconocido",
        userEmail: record.userEmail || "",
        latestEvent: null,
        firstClockIn: null,
        status: "idle",
        statusLabel: "Sin registro hoy",
        statusVariant: "muted",
        events: [],
      });
    }
    const group = userGroupsMap.get(uid)!;
    group.events.push(record);
  }

  // Current local date YYYY-MM-DD
  const todayDateStr = getLocalDateString();

  // Sort events within each group (newer to older) & compute TODAY'S current worker status + overall latest activity
  const userGroupsList: UserRecordGroup[] = Array.from(userGroupsMap.values()).map((group) => {
    // Sort events descending by timestamp (newer to older)
    const sorted = [...group.events].sort(
      (a, b) => b.timestamp.seconds - a.timestamp.seconds
    );
    group.events = sorted;

    const latestOverall = sorted[0] ?? null;

    // Filter events for TODAY to determine current worker state
    const todayEvents = sorted.filter((e) => e.date === todayDateStr);
    const latestToday = todayEvents[0] ?? null;
    const firstClockInToday = [...todayEvents].reverse().find((e) => e.eventType === "clock_in") ?? null;

    group.latestEvent = latestOverall;
    group.firstClockIn = firstClockInToday || [...sorted].reverse().find((e) => e.eventType === "clock_in") || null;

    if (latestToday) {
      if (latestToday.eventType === "clock_in" || latestToday.eventType === "lunch_in") {
        group.status = "clocked_in";
        group.statusLabel = "Entrada Registrada Hoy";
        group.statusVariant = "success";
      } else if (latestToday.eventType === "lunch_out") {
        group.status = "on_lunch";
        group.statusLabel = "En Comida Hoy";
        group.statusVariant = "warning";
      } else if (latestToday.eventType === "clock_out") {
        group.status = "clocked_out";
        group.statusLabel = "Salida Registrada Hoy";
        group.statusVariant = "muted";
      }
    } else {
      group.status = "idle";
      group.statusLabel = "Sin registro hoy";
      group.statusVariant = "muted";
    }

    return group;
  });

  // Sort user groups alphabetically by name
  userGroupsList.sort((a, b) => a.userName.localeCompare(b.userName));

  return (
    <AdminShell>
      <div className="space-y-5">
        {/* Header with Title & View Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Registros de Asistencia</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              {viewMode === "grouped"
                ? `${userGroupsList.length} empleado${userGroupsList.length !== 1 ? "s" : ""} · ${filteredRecords.length} eventos en total`
                : `${filteredRecords.length} eventos en total · actualizaciones en vivo`}
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
            <button
              onClick={() => setViewMode("grouped")}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                viewMode === "grouped"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300",
              ].join(" ")}
            >
              <Users size={14} />
              Por Empleado
            </button>
            <button
              onClick={() => setViewMode("stream")}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                viewMode === "stream"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300",
              ].join(" ")}
            >
              <ListFilter size={14} />
              Registro de Eventos
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo…"
              style={{ paddingLeft: "2.5rem" }}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xs"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="py-2.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xs cursor-pointer"
          >
            <option value="">Todos los eventos</option>
            <option value="clock_in">Entrada</option>
            <option value="lunch_out">Salida a Comida</option>
            <option value="lunch_in">Regreso de Comida</option>
            <option value="clock_out">Salida</option>
          </select>

          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              suppressHydrationWarning
              className="flex-1 py-2.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xs"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              suppressHydrationWarning
              className="flex-1 py-2.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xs"
            />
          </div>
        </div>

        {/* Global Controls when in Grouped Mode */}
        {viewMode === "grouped" && userGroupsList.length > 0 && (
          <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
            <span>Haz clic en cualquier empleado para expandir/colapsar su historial de eventos.</span>
            <div className="flex gap-3">
              <button
                onClick={() => expandAll(userGroupsList.map((g) => g.userId))}
                className="hover:text-blue-600 dark:hover:text-blue-400 underline cursor-pointer"
              >
                Expandir todo
              </button>
              <span>·</span>
              <button
                onClick={collapseAll}
                className="hover:text-blue-600 dark:hover:text-blue-400 underline cursor-pointer"
              >
                Colapsar todo
              </button>
            </div>
          </div>
        )}

        {/* Content Display */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <FileText size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium text-slate-700 dark:text-slate-300">No se encontraron registros de asistencia</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Intenta ajustar el rango de fechas o la búsqueda.</p>
          </div>
        ) : viewMode === "grouped" ? (
          /* GROUPED BY EMPLOYEE VIEW */
          <div className="space-y-3">
            {userGroupsList.map((group) => {
              const isExpanded = expandedUserIds.has(group.userId);
              const latestCfg = group.latestEvent ? eventConfig[group.latestEvent.eventType] : null;

              return (
                <div
                  key={group.userId}
                  className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xs overflow-hidden transition-all duration-200"
                >
                  {/* Single Row per Employee Header (Clickable Accordion Trigger) */}
                  <div
                    onClick={() => toggleExpand(group.userId)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    {/* Left: User Avatar & Today's Real-Time Worker Status */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-sm font-bold text-white shadow-sm flex-shrink-0">
                        {group.userName?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {group.userName}
                          </p>
                          <Badge variant={group.statusVariant} dot>
                            {group.statusLabel}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {group.userEmail}
                        </p>
                      </div>
                    </div>

                    {/* Right: Detailed Summary Metrics & Explicit Latest Activity Event */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center gap-5 text-xs">
                        {/* First Clock In */}
                        {group.firstClockIn && (
                          <div className="hidden md:block text-right">
                            <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
                              Primera Entrada
                            </span>
                            <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold" suppressHydrationWarning>
                              {format(new Date(group.firstClockIn.timestamp.seconds * 1000), "HH:mm")}
                            </span>
                          </div>
                        )}

                        {/* Latest Activity: Event Type Badge + Timestamp */}
                        {group.latestEvent && (
                          <div className="text-left sm:text-right">
                            <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold mb-1">
                              Última Actividad
                            </span>
                            <div className="flex items-center gap-1.5 sm:justify-end flex-wrap">
                              {latestCfg && (
                                <Badge variant={latestCfg.variant} size="sm" className="gap-1 px-1.5 py-0.5 text-[10px] font-bold">
                                  {latestCfg.icon}
                                  {latestCfg.label}
                                </Badge>
                              )}
                              <span className="font-mono text-xs text-slate-800 dark:text-slate-200 font-bold" suppressHydrationWarning>
                                {format(new Date(group.latestEvent.timestamp.seconds * 1000), "d 'de' MMM, HH:mm", { locale: es })}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Total Events Count Chip */}
                        <div className="bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-xl text-slate-600 dark:text-slate-300 font-medium text-xs flex items-center gap-1">
                          <Layers size={13} className="text-blue-500" />
                          <span>{group.events.length} evento{group.events.length !== 1 ? "s" : ""}</span>
                        </div>
                      </div>

                      {/* Expand Chevron */}
                      <button
                        type="button"
                        aria-label="Toggle user events"
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Accordion Body — Detailed Event Timeline for Employee */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 p-4 animate-fade-in">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Historial de Eventos ({group.events.length})
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          Período: {startDate} a {endDate}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {group.events.map((event, idx) => {
                          const cfg = eventConfig[event.eventType];
                          const dateStr = format(new Date(event.timestamp.seconds * 1000), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
                          const timeStr = format(new Date(event.timestamp.seconds * 1000), "HH:mm:ss");

                          return (
                            <div
                              key={event.id || idx}
                              className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl px-4 py-2.5 shadow-2xs hover:border-blue-300 dark:hover:border-blue-500/40 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {cfg && (
                                  <Badge variant={cfg.variant} className="gap-1.5 px-2.5 py-1">
                                    {cfg.icon}
                                    {cfg.label}
                                  </Badge>
                                )}
                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1" suppressHydrationWarning>
                                  <Calendar size={12} />
                                  {dateStr}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200" suppressHydrationWarning>
                                <Clock size={12} className="text-slate-400" />
                                {timeStr}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* STREAM / FLAT LIST VIEW */
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs bg-white dark:bg-slate-800/40">
            {/* Table header */}
            <div className="grid grid-cols-12 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <div className="col-span-3">Empleado</div>
              <div className="col-span-3 hidden sm:block">Correo</div>
              <div className="col-span-3 sm:col-span-2">Evento</div>
              <div className="col-span-3 sm:col-span-2">Fecha</div>
              <div className="col-span-3 sm:col-span-2 text-right">Hora</div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-700/50">
              {filteredRecords.map((record) => {
                const cfg = eventConfig[record.eventType];
                return (
                  <div
                    key={record.id}
                    className="grid grid-cols-12 items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="col-span-3 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {record.userName?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <span className="text-sm text-slate-900 dark:text-slate-200 truncate font-semibold">
                        {record.userName}
                      </span>
                    </div>
                    <div className="col-span-3 hidden sm:block text-sm text-slate-500 dark:text-slate-400 truncate">
                      {record.userEmail}
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                      {cfg && (
                        <Badge variant={cfg.variant} className="gap-1.5">
                          {cfg.icon}
                          {cfg.label}
                        </Badge>
                      )}
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-sm text-slate-600 dark:text-slate-400" suppressHydrationWarning>
                      {format(new Date(record.timestamp.seconds * 1000), "d 'de' MMM", { locale: es })}
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-sm text-slate-900 dark:text-slate-300 font-mono text-right" suppressHydrationWarning>
                      {format(new Date(record.timestamp.seconds * 1000), "HH:mm:ss")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
