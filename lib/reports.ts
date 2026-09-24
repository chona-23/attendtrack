import { AttendanceEvent, getLocalDateString } from "./attendance";
import { IncidenceRecord, INCIDENCE_LABELS } from "./incidences";
import { HolidayRecord, getHolidayForDate } from "./holidays";
import { format, parseISO, differenceInMinutes, addDays } from "date-fns";

export type DailyStatus =
  | "complete"
  | "incomplete"
  | "unconfirmed_out"
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
  daysUnconfirmedOut?: number;
  totalWorkedHours: number;
  averageDailyHours: number;
  lateArrivals: number; // clock-in after 09:05
  earlyDepartures: number; // clock-out before 16:55
  totalIncidences: number;
}

/**
 * Group attendance events by user and date across the given date range,
 * calculating daily status (complete, incomplete, unconfirmed_out, absent, vacation, medical_leave, holiday).
 * Automatically excludes Sundays from working days.
 */
export function aggregateDailyReports(
  events: AttendanceEvent[],
  incidences: IncidenceRecord[] = [],
  holidays: HolidayRecord[] = [],
  startDateStr?: string,
  endDateStr?: string
): DailyReport[] {
  // Collect all unique users across events and incidences
  const usersMap = new Map<string, { userId: string; userName: string; userEmail: string }>();

  for (const ev of events) {
    if (ev.userId && !usersMap.has(ev.userId)) {
      usersMap.set(ev.userId, {
        userId: ev.userId,
        userName: ev.userName || "Empleado",
        userEmail: ev.userEmail || "",
      });
    }
  }

  for (const inc of incidences) {
    if (inc.userId && !usersMap.has(inc.userId)) {
      usersMap.set(inc.userId, {
        userId: inc.userId,
        userName: inc.userName || "Empleado",
        userEmail: inc.userEmail || "",
      });
    }
  }

  // Build lookup maps: userId__date -> AttendanceEvent[] and IncidenceRecord[]
  const eventsMap = new Map<string, AttendanceEvent[]>();
  for (const event of events) {
    const key = `${event.userId}__${event.date}`;
    if (!eventsMap.has(key)) eventsMap.set(key, []);
    eventsMap.get(key)!.push(event);
  }

  const incMap = new Map<string, IncidenceRecord[]>();
  for (const inc of incidences) {
    const key = `${inc.userId}__${inc.date}`;
    if (!incMap.has(key)) incMap.set(key, []);
    incMap.get(key)!.push(inc);
  }

  // Determine date range boundaries
  let start = startDateStr ? parseISO(startDateStr) : new Date();
  let end = endDateStr ? parseISO(endDateStr) : new Date();

  if (!startDateStr || !endDateStr) {
    const allDates: string[] = [];
    events.forEach((e) => allDates.push(e.date));
    incidences.forEach((i) => allDates.push(i.date));
    if (allDates.length > 0) {
      allDates.sort();
      if (!startDateStr) start = parseISO(allDates[0]);
      if (!endDateStr) end = parseISO(allDates[allDates.length - 1]);
    }
  }

  const todayStr = getLocalDateString();
  const reports: DailyReport[] = [];
  const usersList = Array.from(usersMap.values());

  // Loop through every date in interval
  let curr = new Date(start);
  while (curr <= end) {
    // Format YYYY-MM-DD
    const dStr = format(curr, "yyyy-MM-dd");
    const dayOfWeek = curr.getDay(); // 0 = Sunday

    // Exclude Sundays from working days
    if (dayOfWeek !== 0) {
      const hol = getHolidayForDate(dStr, holidays);

      for (const u of usersList) {
        const key = `${u.userId}__${dStr}`;
        const dayEvents = eventsMap.get(key) ?? [];
        const sorted = [...dayEvents].sort(
          (a, b) => (a.timestamp?.seconds ?? 0) - (b.timestamp?.seconds ?? 0)
        );

        const findEventTime = (type: AttendanceEvent["eventType"]) => {
          const e = sorted.find((ev) => ev.eventType === type);
          return e && e.timestamp
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

        let workedMinutes = Math.max(0, totalMinutes - lunchMinutes);
        const dayIncs = incMap.get(key) ?? [];

        const hasVacation = dayIncs.some(
          (i) => i.type === "vacation" && i.status !== "rejected"
        );
        const hasMedicalLeave = dayIncs.some(
          (i) => i.type === "medical_leave" && i.status !== "rejected"
        );

        let status: DailyStatus = "absent";
        const isPastDay = dStr < todayStr;

        if (hol) {
          status = "holiday";
        } else if (hasVacation) {
          status = "vacation";
        } else if (hasMedicalLeave) {
          status = "medical_leave";
        } else if (clockInEvent && clockOutEvent) {
          status = "complete";
        } else if (clockInEvent && !clockOutEvent) {
          if (isPastDay) {
            // Past day with clock-in but missing clock-out -> Salida no confirmada
            status = "unconfirmed_out";
            workedMinutes = 0; // Do not count unconfirmed hours as extra hours
          } else {
            // Today in progress -> Incompleto / En curso
            status = "incomplete";
          }
        } else {
          // No clock-in on a working day (and no holiday/vacation/medical_leave) -> ABSENT
          status = "absent";
        }

        reports.push({
          date: dStr,
          userId: u.userId,
          userName: u.userName,
          userEmail: u.userEmail,
          clockIn: findEventTime("clock_in"),
          lunchOut: findEventTime("lunch_out"),
          lunchIn: findEventTime("lunch_in"),
          clockOut: findEventTime("clock_out"),
          totalMinutes,
          lunchMinutes,
          workedMinutes,
          status,
          holidayName: hol?.name,
          incidences: dayIncs,
        });
      }
    }

    curr = addDays(curr, 1);
  }

  return reports.sort((a, b) =>
    `${b.date}${a.userName}`.localeCompare(`${a.date}${b.userName}`)
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
        daysUnconfirmedOut: 0,
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
    } else if (report.status === "unconfirmed_out") {
      summary.daysPresent++; // Marked present for checking in
      summary.daysUnconfirmedOut = (summary.daysUnconfirmedOut || 0) + 1;
      if (report.clockIn && report.clockIn > "09:05") {
        summary.lateArrivals++;
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
