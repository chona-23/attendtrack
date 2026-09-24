"use client";

import { useState } from "react";
import { format, subDays, differenceInBusinessDays } from "date-fns";
import { BarChart3, Download, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fetchAllAttendanceRecords } from "@/lib/attendance";
import { aggregateDailyReports, aggregateSummaryReports, minutesToHHMM, DailyReport, SummaryReport } from "@/lib/reports";
import { generateDailyCSV, generateSummaryCSV, downloadCSV, generateDailyPDF, generateSummaryPDF } from "@/lib/export";
import { fetchAllIncidences, INCIDENCE_LABELS } from "@/lib/incidences";
import { fetchHolidays } from "@/lib/holidays";

type ReportType = "daily" | "summary";

const STATUS_LABELS_MAP: Record<string, string> = {
  complete: "Completo",
  incomplete: "Incompleto",
  absent: "Ausente",
  vacation: "Vacaciones (PTO)",
  medical_leave: "Incapacidad Médica",
  holiday: "Día Festivo",
};

const INCIDENCE_STATUS_LABELS_MAP: Record<string, string> = {
  approved: "Aprobada",
  rejected: "Rechazada",
  pending: "Pendiente",
};

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("daily");
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);
  const [error, setError] = useState("");

  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [summaryReports, setSummaryReports] = useState<SummaryReport[]>([]);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    setGenerated(false);

    try {
      const [events, incidences, holidays] = await Promise.all([
        fetchAllAttendanceRecords(startDate, endDate),
        fetchAllIncidences(startDate, endDate),
        fetchHolidays(),
      ]);
      const daily = aggregateDailyReports(events, incidences, holidays);
      setDailyReports(daily);

      const businessDays = Math.max(1, differenceInBusinessDays(
        new Date(endDate),
        new Date(startDate)
      ) + 1);
      const summary = aggregateSummaryReports(daily, businessDays);
      setSummaryReports(summary);
      setGenerated(true);
    } catch (err) {
      console.error(err);
      setError("Error al generar el reporte. Inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting("csv");
    try {
      const csvContent =
        reportType === "daily"
          ? generateDailyCSV(dailyReports)
          : generateSummaryCSV(summaryReports);

      const filename = `reporte-asistencia-${reportType}-${startDate}-${endDate}.csv`;
      downloadCSV(csvContent, filename);
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    setExporting("pdf");
    try {
      const dateRange = `${startDate} a ${endDate}`;
      const title = reportType === "daily" ? "Reporte Diario de Asistencia" : "Reporte Resumen de Empleados";

      if (reportType === "daily") {
        await generateDailyPDF(dailyReports, title, dateRange);
      } else {
        await generateSummaryPDF(summaryReports, title, dateRange);
      }
    } finally {
      setExporting(null);
    }
  };

  const reports = reportType === "daily" ? dailyReports : summaryReports;

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Generación de Reportes</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Genera y exporta reportes de asistencia</p>
        </div>

        {/* Config card */}
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-5 shadow-xs">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Configuración del Reporte</h2>

          {/* Report type */}
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Tipo de Reporte</p>
            <div className="flex gap-2">
              {([["daily", "Detalle Diario"], ["summary", "Resumen por Empleado"]] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setReportType(val)}
                  className={[
                    "px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer",
                    reportType === val
                      ? "bg-blue-600 border-blue-500 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Rango de Fechas</p>
            <div className="flex gap-3 items-center flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Desde</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Hasta</span>
                <input
                  type="date"
                  value={endDate}
                  max={format(new Date(), "yyyy-MM-dd")}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xs"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-sm">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <Button
            id="generate-report"
            onClick={handleGenerate}
            loading={loading}
            icon={<BarChart3 size={16} />}
            variant="primary"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Generar Reporte
          </Button>
        </div>

        {/* Results */}
        {generated && (
          <div className="space-y-4 animate-fade-in">
            {/* Export bar */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                <CheckCircle2 size={16} />
                <span>
                  {reports.length} {reportType === "daily" ? "registro diario" : "empleado"}
                  {reports.length !== 1 ? "s" : ""} generado{reports.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  id="export-csv"
                  onClick={handleExportCSV}
                  loading={exporting === "csv"}
                  icon={<FileText size={15} />}
                  variant="secondary"
                  size="sm"
                  className="!bg-white dark:!bg-slate-700 hover:!bg-slate-50 dark:hover:!bg-slate-600 !text-slate-800 dark:!text-slate-200 border-slate-200 dark:border-slate-600 shadow-xs"
                >
                  Exportar CSV
                </Button>
                <Button
                  id="export-pdf"
                  onClick={handleExportPDF}
                  loading={exporting === "pdf"}
                  icon={<Download size={15} />}
                  variant="secondary"
                  size="sm"
                  className="!bg-white dark:!bg-slate-700 hover:!bg-slate-50 dark:hover:!bg-slate-600 !text-slate-800 dark:!text-slate-200 border-slate-200 dark:border-slate-600 shadow-xs"
                >
                  Exportar PDF
                </Button>
              </div>
            </div>

            {/* Preview table */}
            {reports.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl">
                No se encontraron registros para el período seleccionado.
              </div>
            ) : reportType === "daily" ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs bg-white dark:bg-slate-800/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        {["Fecha", "Empleado", "Entrada", "Comida", "Salida", "Trabajado", "Estado", "Incidencias"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                      {(dailyReports as DailyReport[]).map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{r.date}</td>
                          <td className="px-4 py-3 text-slate-900 dark:text-slate-200 font-semibold">{r.userName}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono">{r.clockIn ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">
                            {r.lunchOut && r.lunchIn ? `${r.lunchOut}–${r.lunchIn}` : r.lunchOut ? `${r.lunchOut}…` : "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono">{r.clockOut ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-900 dark:text-slate-300 font-semibold">{minutesToHHMM(r.workedMinutes)}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={r.status === "complete" ? "success" : r.status === "incomplete" ? "warning" : "muted"}
                            >
                              {STATUS_LABELS_MAP[r.status] ?? r.status}
                            </Badge>
                          </td>
                          {/* Incidences cell */}
                          <td className="px-4 py-3 min-w-[180px]">
                            {r.incidences && r.incidences.length > 0 ? (
                              <div className="flex flex-col gap-1.5">
                                {r.incidences.map((inc, idx) => (
                                  <div key={idx} className="flex items-start gap-1.5 flex-wrap">
                                    <span className="text-xs text-slate-800 dark:text-slate-300 font-medium leading-tight">
                                      {INCIDENCE_LABELS[inc.type]}
                                      {inc.type === "extra_hours" && inc.extraHours !== undefined && (
                                        <span className="text-blue-600 dark:text-blue-400 font-bold ml-1">{inc.extraHours.toFixed(1)}h</span>
                                      )}
                                    </span>
                                    <span className={[
                                      "text-[10px] font-bold px-1.5 py-0.5 rounded-full border whitespace-nowrap",
                                      inc.status === "approved"
                                        ? "bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                                        : inc.status === "rejected"
                                        ? "bg-rose-50 dark:bg-rose-500/15 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-400"
                                        : "bg-amber-50 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400",
                                    ].join(" ")}>
                                      {INCIDENCE_STATUS_LABELS_MAP[inc.status] ?? inc.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs bg-white dark:bg-slate-800/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        {["Empleado", "Días Presente", "Días Ausente", "Horas Totales", "Prom./Día", "Llegadas Tardías", "Salidas Tempranas", "Incidencias"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                      {(summaryReports as SummaryReport[]).map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-slate-900 dark:text-slate-200 font-semibold">{r.userName}</p>
                              <p className="text-slate-500 dark:text-slate-400 text-xs">{r.userEmail}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{r.daysPresent}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={r.daysAbsent > 0 ? "text-rose-600 dark:text-rose-400 font-bold" : "text-slate-400 dark:text-slate-500"}>
                              {r.daysAbsent}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-900 dark:text-slate-300 font-semibold">
                            {r.totalWorkedHours.toFixed(1)}h
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {r.averageDailyHours.toFixed(1)}h
                          </td>
                          <td className="px-4 py-3">
                            {r.lateArrivals > 0 ? (
                              <Badge variant="warning">{r.lateArrivals}×</Badge>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {r.earlyDepartures > 0 ? (
                              <Badge variant="danger">{r.earlyDepartures}×</Badge>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600">—</span>
                            )}
                          </td>
                          {/* Incidences summary cell */}
                          <td className="px-4 py-3">
                            {(r.totalIncidences ?? 0) > 0 ? (
                              <span className="text-amber-600 dark:text-amber-400 font-bold">{r.totalIncidences}</span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
