import { AttendanceEvent } from "./attendance";
import { IncidenceRecord, INCIDENCE_LABELS } from "./incidences";
import { HolidayRecord, getHolidayForDate } from "./holidays";
import { format, parseISO, differenceInMinutes } from "date-fns";

export type DailyStatus =
  | "complete"
  | "incomplete"
  | "absent"
  | "vacation"
  | "medical_leave"
  | "holiday";

export interface DailyReport {
  date: string;
  userId: string;
  userName: string;
  userEmail: string;
  project?: string;
  workerType?: string;
  clockIn: string | null;
  lunchOut: string | null;
  lunchIn: string | null;
  clockOut: string | null;
  totalMinutes: number;
  lunchMinutes: number;
  workedMinutes: number;
  status: DailyStatus;
  holidayName?: string;
  /** Incidences logged by the employee on this date */
  incidences: IncidenceRecord[];
}

export interface SummaryReport {
  userId: string;
  userName: string;
  userEmail: string;
  project?: string;
  workerType?: string;
  daysPresent: number;
  daysAbsent: number;
  daysVacation: number;
  daysMedicalLeave: number;
  daysHoliday: number;
  totalWorkedHours: number;
  averageDailyHours: number;
  lateArrivals: number; // clock-in after 09:00
  earlyDepartures: number; // clock-out before 17:00
  totalIncidences: number;
}

/**
 * Group attendance events by user and date, then compute daily stats.
 */
export function aggregateDailyReports(
  events: AttendanceEvent[],
  incidences: IncidenceRecord[] = [],
  holidays: HolidayRecord[] = []
): DailyReport[] {
  // Build incidence lookup: userId__date -> IncidenceRecord[]
  const incMap = new Map<string, IncidenceRecord[]>();
  for (const inc of incidences) {
    const key = `${inc.userId}__${inc.date}`;
    if (!incMap.has(key)) incMap.set(key, []);
    incMap.get(key)!.push(inc);
  }
  // Group events by userId + date
  const groups = new Map<string, AttendanceEvent[]>();

  for (const event of events) {
    const key = `${event.userId}__${event.date}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  }

  const reports: DailyReport[] = [];

  for (const [, dayEvents] of groups) {
    const first = dayEvents[0];
    const sorted = [...dayEvents].sort(
      (a, b) => a.timestamp.seconds - b.timestamp.seconds
    );

    const findEvent = (type: AttendanceEvent["eventType"]) => {
      const e = sorted.find((ev) => ev.eventType === type);
      return e
        ? format(new Date(e.timestamp.seconds * 1000), "HH:mm")
        : null;
    };

    const clockInEvent = sorted.find((ev) => ev.eventType === "clock_in");
    const clockOutEvent = sorted.find((ev) => ev.eventType === "clock_out");
    const lunchOutEvent = sorted.find((ev) => ev.eventType === "lunch_out");
    const lunchInEvent = sorted.find((ev) => ev.eventType === "lunch_in");

    let totalMinutes = 0;
    let lunchMinutes = 0;

    if (clockInEvent && clockOutEvent) {
      totalMinutes = differenceInMinutes(
        new Date(clockOutEvent.timestamp.seconds * 1000),
        new Date(clockInEvent.timestamp.seconds * 1000)
      );
    }

    if (lunchOutEvent && lunchInEvent) {
      lunchMinutes = differenceInMinutes(
        new Date(lunchInEvent.timestamp.seconds * 1000),
        new Date(lunchOutEvent.timestamp.seconds * 1000)
      );
    }

    const workedMinutes = totalMinutes - lunchMinutes;
    const incKey = `${first.userId}__${first.date}`;
    const dayIncs = incMap.get(incKey) ?? [];

    // Check special statuses: Holiday, Vacation, Medical Leave
    const hol = getHolidayForDate(first.date, holidays);
    const hasVacation = dayIncs.some(
      (i) => i.type === "vacation" && i.status !== "rejected"
    );
    const hasMedicalLeave = dayIncs.some(
      (i) => i.type === "medical_leave" && i.status !== "rejected"
    );

    let status: DailyStatus = "absent";
    if (hol) {
      status = "holiday";
    } else if (hasVacation) {
      status = "vacation";
    } else if (hasMedicalLeave) {
      status = "medical_leave";
    } else if (clockInEvent && clockOutEvent) {
      status = "complete";
    } else if (clockInEvent) {
      status = "incomplete";
    }

    reports.push({
      date: first.date,
      userId: first.userId,
      userName: first.userName,
      userEmail: first.userEmail,
      clockIn: findEvent("clock_in"),
      lunchOut: findEvent("lunch_out"),
      lunchIn: findEvent("lunch_in"),
      clockOut: findEvent("clock_out"),
      totalMinutes,
      lunchMinutes,
      workedMinutes,
      status,
      holidayName: hol?.name,
      incidences: dayIncs,
    });
  }

  return reports.sort((a, b) =>
    `${a.date}${a.userName}`.localeCompare(`${b.date}${b.userName}`)
  );
}

/**
 * Aggregate daily reports into per-employee summaries.
 */
export function aggregateSummaryReports(
  dailyReports: DailyReport[],
  expectedWorkDays: number
): SummaryReport[] {
  const summaries = new Map<string, SummaryReport>();

  for (const report of dailyReports) {
    if (!summaries.has(report.userId)) {
      summaries.set(report.userId, {
        userId: report.userId,
        userName: report.userName,
        userEmail: report.userEmail,
        daysPresent: 0,
        daysAbsent: 0,
        daysVacation: 0,
        daysMedicalLeave: 0,
        daysHoliday: 0,
        totalWorkedHours: 0,
        averageDailyHours: 0,
        lateArrivals: 0,
        earlyDepartures: 0,
        totalIncidences: 0,
      });
    }

    const summary = summaries.get(report.userId)!;

    if (report.status === "complete" || report.status === "incomplete") {
      summary.daysPresent++;
      summary.totalWorkedHours += report.workedMinutes / 60;

      // Late arrival: clock-in after 09:05
      if (report.clockIn && report.clockIn > "09:05") {
        summary.lateArrivals++;
      }
      // Early departure: clock-out before 16:55
      if (report.clockOut && report.clockOut < "16:55") {
        summary.earlyDepartures++;
      }
    } else if (report.status === "vacation") {
      summary.daysVacation++;
    } else if (report.status === "medical_leave") {
      summary.daysMedicalLeave++;
    } else if (report.status === "holiday") {
      summary.daysHoliday++;
    } else if (report.status === "absent") {
      summary.daysAbsent++;
    }

    summary.totalIncidences += report.incidences.length;
  }

  // Compute averages
  for (const [, summary] of summaries) {
    summary.averageDailyHours =
      summary.daysPresent > 0
        ? summary.totalWorkedHours / summary.daysPresent
        : 0;
  }

  return Array.from(summaries.values()).sort((a, b) =>
    a.userName.localeCompare(b.userName)
  );
}

export function minutesToHHMM(minutes: number): string {
  if (!minutes || minutes < 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}
