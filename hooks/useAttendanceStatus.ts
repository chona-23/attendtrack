"use client";

import { useState, useEffect } from "react";
import { subscribeToTodayEvents } from "@/lib/attendance";
import { deriveStatus, AttendanceEvent, AttendanceStatus } from "@/lib/attendance";
import { useAuth } from "@/lib/auth-context";

interface AttendanceStatusResult {
  status: AttendanceStatus;
  todayEvents: AttendanceEvent[];
  loading: boolean;
}

export function useAttendanceStatus(): AttendanceStatusResult {
  const { user, profile } = useAuth();
  const [todayEvents, setTodayEvents] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fallbackTimer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 1500);

    const unsubscribe = subscribeToTodayEvents(user.uid, (events) => {
      if (!isMounted) return;
      clearTimeout(fallbackTimer);
      setTodayEvents(events);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, [user]);

  const status = deriveStatus(todayEvents);

  return { status, todayEvents, loading };
}
