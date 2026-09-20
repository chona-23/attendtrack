"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  LogOut,
  Building2,
  Shield,
  AlertTriangle,
} from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/admin/employees", label: "Empleados", icon: Users },
  { href: "/admin/records", label: "Registros", icon: FileText },
  { href: "/admin/incidences", label: "Incidencias", icon: AlertTriangle },
  { href: "/admin/reports", label: "Reportes", icon: BarChart3 },
];

function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try { await fetch("/api/admin/verify", { method: "DELETE" }); } catch {}
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_logged_in");
      document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    router.push("/admin/login");
  };

  return (
    <aside
      className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-white dark:bg-slate-900 text-slate-800 dark:text-white z-30 border-r border-slate-200 dark:border-slate-800 select-none shadow-sm transition-colors duration-200"
      style={{ width: "16rem", minWidth: "16rem", flexShrink: 0 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 dark:border-rose-500/30 flex items-center justify-center">
          <Shield size={18} className="text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <p className="font-bold text-sm text-slate-900 dark:text-slate-100">Consola Admin</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">AttendTrack</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {adminNavItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200",
              ].join(" ")}
            >
              <Icon size={18} className={active ? "text-rose-600 dark:text-rose-400" : ""} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 dark:border-rose-500/30 flex items-center justify-center">
            <Shield size={14} className="text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Administrador</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Acceso total</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function AdminBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try { await fetch("/api/admin/verify", { method: "DELETE" }); } catch {}
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_logged_in");
      document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    router.push("/admin/login");
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="flex items-center justify-around px-2 py-2">
        {adminNavItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all",
                active ? "text-slate-900 dark:text-slate-200 font-semibold" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300",
              ].join(" ")}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-3 py-1.5 text-slate-500 hover:text-rose-500 transition-all"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-medium">Salir</span>
        </button>
      </div>
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const isLoggedIn =
        sessionStorage.getItem("admin_logged_in") === "true" ||
        document.cookie.includes("admin_session");

      if (!isLoggedIn) {
        router.push("/admin/login");
      } else {
        setAuthorized(true);
      }
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 text-sm">
        Verificando acceso de administrador...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen" style={{ minWidth: 0, flex: "1 1 0%" }}>
        <main className="flex-1 pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      <AdminBottomNav />
    </div>
  );
}
