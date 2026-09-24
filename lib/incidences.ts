import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";
import { getLocalDateString } from "./attendance";

// ─── Types ────────────────────────────────────────────────────────────────────

export type IncidenceType =
  | "vacation"
  | "medical_leave"
  | "late_arrival_approved"
  | "early_departure_approved"
  | "extra_hours"
  | "childcare"
  | "medical"
  | "emergency"
  | "other";

export type IncidenceStatus = "pending" | "approved" | "rejected";

export interface IncidenceRecord {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD for multi-day time-off / medical leave
  type: IncidenceType;
  notes: string;
  status: IncidenceStatus;
  timestamp: Timestamp;
  extraHours?: number;
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export const INCIDENCE_LABELS: Record<IncidenceType, string> = {
  vacation: "Vacaciones (Paid Time-Off)",
  medical_leave: "Incapacidad Médica (Medical Leave)",
  late_arrival_approved: "Llegada tardía pre-aprobada",
  early_departure_approved: "Salida anticipada pre-aprobada",
  extra_hours: "Horas extra trabajadas",
  childcare: "Cuidado de hijos",
  medical: "Cita / Asunto médico",
  emergency: "Emergencia personal",
  other: "Otra / Solicitud especial",
};

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Record a new incidence or time-off / medical leave for an employee.
 * If endDate is provided (for vacations / medical leave), generates records for each date in the range.
 */
export async function recordIncidence(
  userId: string,
  userEmail: string,
  userName: string,
  type: IncidenceType,
  notes: string,
  date?: string,
  extraHours?: number,
  endDate?: string
): Promise<void> {
  const startDateStr = date ?? getLocalDateString();
  const endDateStr = endDate && endDate >= startDateStr ? endDate : startDateStr;

  // Generate date list between startDate and endDate
  const dates: string[] = [];
  const curr = new Date(startDateStr + "T12:00:00");
  const end = new Date(endDateStr + "T12:00:00");

  while (curr <= end) {
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, "0");
    const d = String(curr.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    curr.setDate(curr.getDate() + 1);
  }

  for (const dStr of dates) {
    const payload: Record<string, unknown> = {
      userId,
      userEmail,
      userName,
      date: dStr,
      startDate: startDateStr,
      endDate: endDateStr,
      type,
      notes,
      status: "pending" as IncidenceStatus,
      timestamp: Timestamp.now(),
    };
    if (type === "extra_hours" && extraHours !== undefined) {
      payload.extraHours = extraHours;
    }
    await addDoc(collection(db, "incidences"), payload);
  }
}

// ─── Employee real-time listener ──────────────────────────────────────────────

/**
 * Subscribe to a user's incidences (most recent 50), ordered by timestamp desc.
 */
export function subscribeToUserIncidences(
  userId: string,
  callback: (records: IncidenceRecord[]) => void
): () => void {
  const q = query(
    collection(db, "incidences"),
    where("userId", "==", userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const records: IncidenceRecord[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<IncidenceRecord, "id">),
      }));
      records.sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0));
      callback(records.slice(0, 50));
    },
    (err) => {
      console.warn("subscribeToUserIncidences error:", err);
      callback([]);
    }
  );
}

// ─── Admin fetch ──────────────────────────────────────────────────────────────

/**
 * Fetch all incidences for a date range, optionally filtered by employee.
 */
export async function fetchAllIncidences(
  startDate: string,
  endDate: string,
  employeeId?: string
): Promise<IncidenceRecord[]> {
  const constraints = [
    where("date", ">=", startDate),
    where("date", "<=", endDate),
  ];

  if (employeeId) {
    constraints.unshift(where("userId", "==", employeeId));
  }

  const q = query(collection(db, "incidences"), ...constraints);
  const snapshot = await getDocs(q);

  const records: IncidenceRecord[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<IncidenceRecord, "id">),
  }));

  records.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0);
  });

  return records;
}

// ─── Admin: update status ─────────────────────────────────────────────────────

/**
 * Set the status of an incidence (approve / reject).
 */
export async function updateIncidenceStatus(
  incidenceId: string,
  status: IncidenceStatus
): Promise<void> {
  await updateDoc(doc(collection(db, "incidences"), incidenceId), { status });
}

// ─── Admin: real-time all incidences ──────────────────────────────────────────

/**
 * Subscribe to ALL incidences (admin view), optionally filtered by status.
 */
export function subscribeToAllIncidences(
  callback: (records: IncidenceRecord[]) => void,
  statusFilter?: IncidenceStatus
): () => void {
  const constraints = statusFilter
    ? [where("status", "==", statusFilter)]
    : [];

  const q = query(collection(db, "incidences"), ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      const records: IncidenceRecord[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<IncidenceRecord, "id">),
      }));
      records.sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0));
      callback(records);
    },
    (err) => {
      console.warn("subscribeToAllIncidences error:", err);
      callback([]);
    }
  );
}
