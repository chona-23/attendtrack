"use client";

import { DailyReport, SummaryReport, minutesToHHMM } from "./reports";
import { INCIDENCE_LABELS } from "./incidences";

// ─── CSV Export ──────────────────────────────────────────────────────────────

export function generateDailyCSV(reports: DailyReport[]): string {
  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const headers = [
    "Fecha",
    "Empleado",
    "Correo",
    "Proyecto",
    "Tipo de Trabajo",
    "Entrada",
    "Salida Comida",
    "Regreso Comida",
    "Salida",
    "Tiempo Total",
    "Tiempo Comida",
    "Horas Trabajadas",
    "Estado",
    "Incidencias",
  ];

  const statusMap: Record<string, string> = {
    complete: "Completo",
    incomplete: "Incompleto",
    absent: "Ausente",
    vacation: "Vacaciones (PTO)",
    medical_leave: "Incapacidad Médica",
    holiday: "Día Festivo",
  };

  const rows = reports.map((r) => {
    const incText = r.incidences && r.incidences.length > 0
      ? r.incidences.map((i) => {
          let label = `${INCIDENCE_LABELS[i.type]}`;
          if (i.type === "extra_hours" && i.extraHours !== undefined) {
            label += ` (${i.extraHours.toFixed(1)}h)`;
          }
          if (i.notes) label += `: ${i.notes}`;
          return label;
        }).join(" | ")
      : "—";
    return [
      r.date,
      r.userName,
      r.userEmail,
      r.project ?? "—",
      r.workerType ?? "—",
      r.clockIn ?? "—",
      r.lunchOut ?? "—",
      r.lunchIn ?? "—",
      r.clockOut ?? "—",
      minutesToHHMM(r.totalMinutes),
      minutesToHHMM(r.lunchMinutes),
      minutesToHHMM(r.workedMinutes),
      statusMap[r.status] || r.status,
      incText,
    ];
  });

  return [headers, ...rows]
    .map((row) => row.map((cell) => esc(String(cell))).join(","))
    .join("\n");
}

export function generateSummaryCSV(reports: SummaryReport[]): string {
  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const headers = [
    "Empleado",
    "Correo",
    "Proyecto",
    "Tipo de Trabajo",
    "Días Presente",
    "Días Ausente",
    "Total Horas Trabajadas",
    "Promedio Horas Diarias",
    "Entradas Tardías",
    "Salidas Anticipadas",
    "Total Incidencias",
  ];

  const rows = reports.map((r) => [
    r.userName,
    r.userEmail,
    r.project ?? "—",
    r.workerType ?? "—",
    r.daysPresent.toString(),
    r.daysAbsent.toString(),
    r.totalWorkedHours.toFixed(2),
    r.averageDailyHours.toFixed(2),
    r.lateArrivals.toString(),
    r.earlyDepartures.toString(),
    (r.totalIncidences ?? 0).toString(),
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => esc(String(cell))).join(","))
    .join("\n");
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── PDF Export ──────────────────────────────────────────────────────────────

export async function generateDailyPDF(
  reports: DailyReport[],
  title: string,
  dateRange: string
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const statusMap: Record<string, string> = {
    complete: "Completo",
    incomplete: "Incompleto",
    absent: "Ausente",
    vacation: "Vacaciones (PTO)",
    medical_leave: "Incapacidad Médica",
    holiday: "Día Festivo",
  };

  // Header
  doc.setFillColor(30, 41, 59); // Navy #1e293b
  doc.rect(0, 0, 297, 25, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("AttendTrack — Reporte de Asistencia Empresarial", 14, 10);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(title, 14, 17);
  doc.text(`Periodo: ${dateRange}`, 14, 22);
  doc.text(
    `Generado: ${new Date().toLocaleString()}`,
    297 - 14,
    22,
    { align: "right" }
  );

  autoTable(doc, {
    startY: 30,
    head: [
      [
        "Fecha",
        "Empleado",
        "Correo",
        "Entrada",
        "Salida Comida",
        "Regreso Comida",
        "Salida",
        "Horas Trabajadas",
        "Estado",
        "Incidencias",
      ],
    ],
    body: reports.map((r) => [
      r.date,
      r.userName,
      r.userEmail,
      r.clockIn ?? "—",
      r.lunchOut ?? "—",
      r.lunchIn ?? "—",
      r.clockOut ?? "—",
      minutesToHHMM(r.workedMinutes),
      statusMap[r.status] || r.status,
      r.incidences && r.incidences.length > 0
        ? r.incidences.map((i) => INCIDENCE_LABELS[i.type]).join("\n")
        : "—",
    ]),
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 7, cellPadding: 2 },
    columnStyles: { 9: { cellWidth: 40 } },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageCount = (doc as any).internal.getNumberOfPages() as number;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Página ${i} de ${pageCount} — Confidencial`,
      297 / 2,
      210 - 5,
      { align: "center" }
    );
  }

  doc.save(`reporte-asistencia-${Date.now()}.pdf`);
}

export async function generateSummaryPDF(
  reports: SummaryReport[],
  title: string,
  dateRange: string
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 25, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("AttendTrack — Reporte Resumen", 14, 10);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(title, 14, 17);
  doc.text(`Periodo: ${dateRange}`, 14, 22);

  autoTable(doc, {
    startY: 30,
    head: [
      [
        "Empleado",
        "Correo",
        "Días Presente",
        "Días Ausente",
        "Total Horas",
        "Prom/Día",
        "Tardanzas",
        "Salidas Ant.",
        "Incidencias",
      ],
    ],
    body: reports.map((r) => [
      r.userName,
      r.userEmail,
      r.daysPresent,
      r.daysAbsent,
      r.totalWorkedHours.toFixed(1) + "h",
      r.averageDailyHours.toFixed(1) + "h",
      r.lateArrivals,
      r.earlyDepartures,
      r.totalIncidences ?? 0,
    ]),
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  doc.save(`reporte-resumen-${Date.now()}.pdf`);
}
