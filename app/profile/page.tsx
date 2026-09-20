"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { User, Mail, Shield, ShieldCheck, Calendar, Briefcase, Clock, Laptop } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const WORKER_TYPE_LABELS: Record<string, string> = {
  virtual: "Virtual / Home Office",
  onsite: "Presencial",
  hybrid: "Híbrido",
  other: "Otro",
};

export default function ProfilePage() {
  const { user, profile, loading, is2FAVerified, needs2FASetup, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (needs2FASetup) { router.replace("/setup-2fa"); return; }
    if (!is2FAVerified) { router.replace("/verify-2fa"); return; }
  }, [user, loading, is2FAVerified, needs2FASetup, router]);

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const showWorkProfile =
    profile.role === "admin" ||
    profile.showWorkProfile === true ||
    profile.profileVisible === true;

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Perfil</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Detalles de tu cuenta</p>
        </div>

        {/* Avatar card */}
        <Card padding="lg" className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {profile.displayName?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{profile.displayName}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="info" dot>{profile.role === "admin" ? "Administrador" : "Empleado"}</Badge>
                {profile.totpEnabled && (
                  <Badge variant="success" dot>2FA Activo</Badge>
                )}
                {profile.workerType && showWorkProfile && (
                  <Badge variant="purple">
                    {WORKER_TYPE_LABELS[profile.workerType] || profile.workerType}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Work Profile Section (Only visible if admin enabled visibility or user is admin) */}
        {showWorkProfile && (
          <Card padding="md" className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider">
                Asignación Laboral y Horario
              </h3>
              <Badge variant="muted">Configurado por Admin</Badge>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: <Briefcase size={16} />,
                  label: "Proyecto Asignado",
                  value: profile.project ? profile.project : "Sin asignar",
                },
                {
                  icon: <Laptop size={16} />,
                  label: "Tipo de Trabajo",
                  value: profile.workerType
                    ? WORKER_TYPE_LABELS[profile.workerType] || profile.workerType
                    : "No especificado",
                },
                {
                  icon: <Clock size={16} />,
                  label: "Horario de Trabajo",
                  value:
                    profile.workingHoursStart && profile.workingHoursEnd
                      ? `${profile.workingHoursStart} – ${profile.workingHoursEnd}`
                      : "09:00 – 17:00 (Estándar)",
                },
                {
                  icon: <ShieldCheck size={16} />,
                  label: "Autorización de Horas Extra",
                  value: profile.extraHoursAuthorized
                    ? `Autorizado (Máx ${profile.extraHoursAllowed ?? 0} hrs)`
                    : "No Autorizado",
                  extra: profile.extraHoursAuthorized ? (
                    <Badge variant="success">Autorizado</Badge>
                  ) : (
                    <Badge variant="muted">No Autorizado</Badge>
                  ),
                },
              ].map(({ icon, label, value, extra }) => (
                <div key={label} className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-700/60 last:border-0">
                  <div className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0">{icon}</div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{value}</p>
                  </div>
                  {extra && <div>{extra}</div>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Details */}
        <Card padding="md" className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-xs">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider mb-4">
            Información de la Cuenta
          </h3>
          <div className="space-y-4">
            {[
              { icon: <User size={16} />, label: "Nombre Completo", value: profile.displayName },
              { icon: <Mail size={16} />, label: "Correo Electrónico", value: profile.email },
              {
                icon: <Calendar size={16} />,
                label: "Miembro Desde",
                value: profile.createdAt
                  ? format(new Date(profile.createdAt), "d 'de' MMMM 'de' yyyy")
                  : "—",
              },
              {
                icon: <Shield size={16} />,
                label: "Estado de 2FA",
                value: profile.totpEnabled ? "Habilitado" : "No configurado",
                extra: profile.totpEnabled ? (
                  <Badge variant="success">Activo</Badge>
                ) : (
                  <Badge variant="warning">Configuración Requerida</Badge>
                ),
              },
            ].map(({ icon, label, value, extra }) => (
              <div key={label} className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-700/60 last:border-0">
                <div className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0">{icon}</div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{value}</p>
                </div>
                {extra && <div>{extra}</div>}
              </div>
            ))}
          </div>
        </Card>

        {/* 2FA section */}
        <Card padding="md" className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Autenticación de Dos Factores</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {profile.totpEnabled
              ? "Tu cuenta está protegida con autenticación TOTP. Compatible con Microsoft Authenticator y Google Authenticator."
              : "Habilita 2FA para proteger tu cuenta con una aplicación de código de seguridad de un solo uso."}
          </p>
          {!profile.totpEnabled && (
            <Button
              id="enable-2fa"
              variant="primary"
              size="sm"
              onClick={() => router.push("/setup-2fa")}
              icon={<Shield size={14} />}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Habilitar 2FA
            </Button>
          )}
        </Card>

        {/* Sign out */}
        <Button
          id="profile-signout"
          variant="outline"
          fullWidth
          onClick={signOut}
          className="text-rose-600 border-rose-200 hover:bg-rose-50"
        >
          Cerrar Sesión
        </Button>
      </div>
    </AppShell>
  );
}
