import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  query,
  getDocs,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface HolidayRecord {
  id?: string;
  date: string; // YYYY-MM-DD
  name: string; // e.g. "Año Nuevo", "Navidad"
  createdAt?: string;
}

/**
 * Add a new official Holiday ("Día Festivo").
 */
export async function addHoliday(date: string, name: string): Promise<void> {
  const payload = {
    date,
    name: name.trim(),
    createdAt: new Date().toISOString(),
    timestamp: Timestamp.now(),
  };
  await addDoc(collection(db, "holidays"), payload);
}

/**
 * Delete a Holiday.
 */
export async function removeHoliday(id: string): Promise<void> {
  await deleteDoc(doc(db, "holidays", id));
}

/**
 * Fetch all holidays.
 */
export async function fetchHolidays(): Promise<HolidayRecord[]> {
  try {
    const q = query(collection(db, "holidays"));
    const snapshot = await getDocs(q);
    const holidays: HolidayRecord[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<HolidayRecord, "id">),
    }));
    holidays.sort((a, b) => a.date.localeCompare(b.date));
    return holidays;
  } catch (err) {
    console.warn("fetchHolidays error:", err);
    return [];
  }
}

/**
 * Real-time listener for all holidays.
 */
export function subscribeToHolidays(
  callback: (holidays: HolidayRecord[]) => void
): () => void {
  const q = query(collection(db, "holidays"));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: HolidayRecord[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<HolidayRecord, "id">),
      }));
      list.sort((a, b) => a.date.localeCompare(b.date));
      callback(list);
    },
    (err) => {
      console.warn("subscribeToHolidays error:", err);
      callback([]);
    }
  );
}

/**
 * Helper to check if a specific YYYY-MM-DD string is a holiday.
 */
export function getHolidayForDate(
  date: string,
  holidays: HolidayRecord[]
): HolidayRecord | undefined {
  return holidays.find((h) => h.date === date);
}
