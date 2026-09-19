"use client";

import { useState, useEffect } from "react";
import { enableNetwork, disableNetwork } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      enableNetwork(db).catch(console.warn);
    };
    const handleOffline = () => {
      setIsOnline(false);
      disableNetwork(db).catch(console.warn);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
