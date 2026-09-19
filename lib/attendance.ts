import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

export type AttendanceEventType =
  | "clock_in"
  | "lunch_out"
  | "lunch_in"
  | "clock_out";

export type AttendanceStatus =
  | "idle"
  | "clocked_in"
  | "on_lunch"
  | "clocked_out";

export interface AttendanceEvent {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  eventType: AttendanceEventType;
  timestamp: Timestamp;
  date: string; // YYYY-MM-DD for easy filtering
  synced?: boolean;
}

/**
 * Helper to get local date string YYYY-MM-DD (matches local employee timezone, not UTC)
 */
export function getLocalDateString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Write an attendance event.
 * Thanks to offline persistence, this succeeds immediately even when offline
 * and syncs to Firestore automatically when connectivity is restored.
 */
export async function recordAttendanceEvent(
  userId: string,
  userEmail: string,
  userName: string,
  eventType: AttendanceEventType
): Promise<void> {
  const now = new Date();
  const date = getLocalDateString(now); // Local YYYY-MM-DD

  await addDoc(collection(db, "attendance"), {
    userId,
    userEmail,
    userName,
    eventType,
    timestamp: Timestamp.now(),
    date,
  });
}

/**
 * Subscribe to today's attendance events for a specific user.
 * Returns an unsubscribe function.
 */
export function subscribeToTodayEvents(
  userId: string,
  callback: (events: AttendanceEvent[]) => void
): () => void {
  const today = getLocalDateString(new Date());

  const q = query(
    collection(db, "attendance"),
    where("userId", "==", userId),
    where("date", "==", today)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const events: AttendanceEvent[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<AttendanceEvent, "id">),
      }));
      events.sort((a, b) => {
        const tA = a.timestamp?.seconds ?? 0;
        const tB = b.timestamp?.seconds ?? 0;
        return tA - tB;
      });
      callback(events);
    },
    (error) => {
      console.warn("subscribeToTodayEvents error, falling back to empty:", error);
      callback([]);
    }
  );
}

/**
 * Subscribe to all events for a user (for history page).
 */
export function subscribeToUserHistory(
  userId: string,
  callback: (events: AttendanceEvent[]) => void,
  limitCount = 100
): () => void {
  const q = query(
    collection(db, "attendance"),
    where("userId", "==", userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const events: AttendanceEvent[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<AttendanceEvent, "id">),
      }));
      events.sort((a, b) => {
        const tA = a.timestamp?.seconds ?? 0;
        const tB = b.timestamp?.seconds ?? 0;
        return tB - tA;
      });
      callback(events.slice(0, limitCount));
    },
    (error) => {
      console.warn("subscribeToUserHistory error, falling back to empty:", error);
      callback([]);
    }
  );
}

/**
 * Derive the current attendance status from today's events.
 */
export function deriveStatus(events: AttendanceEvent[]): AttendanceStatus {
  if (events.length === 0) return "idle";

  const lastEvent = events[events.length - 1];
  switch (lastEvent.eventType) {
    case "clock_in":
    case "lunch_in":
      return "clocked_in";
    case "lunch_out":
      return "on_lunch";
    case "clock_out":
      return "clocked_out";
    default:
      return "idle";
  }
}

/**
 * Admin: fetch all attendance records for a date range.
 */
export async function fetchAllAttendanceRecords(
  startDate: string,
  endDate: string,
  employeeId?: string
): Promise<AttendanceEvent[]> {
  const constraints = [
    where("date", ">=", startDate),
    where("date", "<=", endDate),
  ];

  if (employeeId) {
    constraints.unshift(where("userId", "==", employeeId));
  }

  const q = query(collection(db, "attendance"), ...constraints);
  const snapshot = await getDocs(q);

  const events: AttendanceEvent[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<AttendanceEvent, "id">),
  }));

  events.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.timestamp?.seconds ?? 0) - (b.timestamp?.seconds ?? 0);
  });

  return events;
}

/**
 * Admin: subscribe to all attendance records (live, for records page).
 */
export function subscribeToAllRecords(
  startDate: string,
  endDate: string,
  callback: (events: AttendanceEvent[]) => void,
  employeeId?: string
): () => void {
  const baseConstraints = [
    where("date", ">=", startDate),
    where("date", "<=", endDate),
  ];

  if (employeeId) {
    baseConstraints.unshift(where("userId", "==", employeeId));
  }

  const q = query(collection(db, "attendance"), ...baseConstraints);

  return onSnapshot(
    q,
    (snapshot) => {
      const events: AttendanceEvent[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<AttendanceEvent, "id">),
      }));
      events.sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0);
      });
      callback(events);
    },
    (error) => {
      console.warn("subscribeToAllRecords error, falling back to empty:", error);
      callback([]);
    }
  );
}
