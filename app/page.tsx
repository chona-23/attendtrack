"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function RootPage() {
  const { user, loading, is2FAVerified, needs2FASetup } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      if (pathname.startsWith("/admin")) {
        window.location.href = pathname;
        return;
      }
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (needs2FASetup) {
      router.replace("/setup-2fa");
      return;
    }

    if (!is2FAVerified) {
      router.replace("/verify-2fa");
      return;
    }

    router.replace("/dashboard");
  }, [user, loading, is2FAVerified, needs2FASetup, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}
