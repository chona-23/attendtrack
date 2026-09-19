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
  type: IncidenceType;
  notes: string;
  status: IncidenceStatus;
  timestamp: Timestamp;
  extraHours?: number;
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export const INCIDENCE_LABELS: Record<IncidenceType, string> = {
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
 * Record a new incidence for an employee.
 */
export async function recordIncidence(
  userId: string,
  userEmail: string,
  userName: string,
  type: IncidenceType,
  notes: string,
  date?: string,
  extraHours?: number
): Promise<void> {
  const payload: Record<string, unknown> = {
    userId,
    userEmail,
    userName,
    date: date ?? getLocalDateString(),
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
