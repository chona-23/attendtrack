"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  History,
  User,
  LogOut,
  Wifi,
  WifiOff,
  Building2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/history", label: "Historial", icon: History },
  { href: "/profile", label: "Perfil", icon: User },
];

function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const isOnline = useOnlineStatus();

  return (
    <aside
      className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-white dark:bg-[#1e293b] text-slate-800 dark:text-white z-30 border-r border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-200 select-none"
      style={{ width: "16rem", minWidth: "16rem", flexShrink: 0 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-slate-700">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
          <Building2 size={18} />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight text-slate-900 dark:text-white">AttendTrack</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Enterprise</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href === "/dashboard" && pathname === "/");
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white",
              ].join(" ")}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
        {/* Online status */}
        <div
          className={[
            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium",
            isOnline
              ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-transparent"
              : "bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-transparent",
          ].join(" ")}
        >
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          {isOnline ? "Conectado" : "Sin conexión — se sincronizará"}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold">
            {profile?.displayName?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
              {profile?.displayName ?? "Empleado"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="text-slate-400 hover:text-rose-500 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function BottomNav() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#1e293b] border-t border-slate-200 dark:border-slate-700 transition-colors duration-200 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href === "/dashboard" && pathname === "/");
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all",
                active
                  ? "text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
              ].join(" ")}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={signOut}
          className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-all"
        >
          <LogOut size={22} />
          <span className="text-[10px] font-medium">Salir</span>
        </button>
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen" style={{ minWidth: 0, flex: "1 1 0%" }}>
        <main className="flex-1 pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
