"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { collection, getDocs, query, where, doc, updateDoc, setDoc } from "firebase/firestore";
import { format } from "date-fns";
import {
  Search, Users, RefreshCw, Mail, Clock,
  Pencil, X, Save, Trash2, AlertTriangle, Eye, EyeOff,
  KeyRound, User as UserIcon, Briefcase, Building2,
  Timer, Zap, MonitorCheck,
} from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { Badge } from "@/components/ui/Badge";
import { db } from "@/lib/firebase";

// ── Types ──────────────────────────────────────────────────────────────────
type WorkerType = "virtual" | "onsite" | "hybrid" | "other" | "";

interface WorkingHours {
  start: string;
  end: string;
}

interface Employee {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  createdAt: string;
  lastEvent?: { eventType: string; timestamp: { seconds: number } };
  todayStatus?: string;
  // Work profile fields
  project?: string;
  workerType?: WorkerType;
  workingHours?: WorkingHours;
  extraHoursAuthorized?: boolean;
  extraHoursAllowed?: number;
  profileVisible?: boolean;
  showWorkProfile?: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────
const statusLabels: Record<string, { label: string; variant: "success" | "warning" | "info" | "muted" }> = {
  clocked_in:  { label: "Presente",           variant: "success" },
  on_lunch:    { label: "En Comida",          variant: "warning" },
  clocked_out: { label: "Salida Registrada",  variant: "muted" },
  idle:        { label: "Ausente",            variant: "muted" },
};

const WORKER_TYPE_OPTIONS: { value: WorkerType; label: string; icon: string }[] = [
  { value: "virtual",  label: "Virtual / Home Office", icon: "🏠" },
  { value: "onsite",   label: "Presencial",            icon: "🏢" },
  { value: "hybrid",   label: "Híbrido",               icon: "🔀" },
  { value: "other",    label: "Otro",                  icon: "✦"  },
];

const WORKER_TYPE_LABELS: Record<string, string> = {
  virtual: "Virtual",
  onsite:  "Presencial",
  hybrid:  "Híbrido",
  other:   "Otro",
};

// ── Toggle Switch Component ────────────────────────────────────────────────
function ToggleSwitch({
  id, checked, onChange, label,
}: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer select-none">
      <div
        id={id}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => (e.key === " " || e.key === "Enter") && onChange(!checked)}
        className={[
          "relative w-11 h-6 rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60",
          checked ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
        />
      </div>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  );
}

// ── Edit Modal ─────────────────────────────────────────────────────────────
function EditEmployeeModal({
  employee, onClose, onSaved,
}: {
  employee: Employee;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [tab, setTab] = useState<"account" | "work">("account");

  // Account fields
  const [displayName, setDisplayName] = useState(employee.displayName ?? "");
  const [email, setEmail]             = useState(employee.email ?? "");
  const [password, setPassword]       = useState("");
  const [showPw, setShowPw]           = useState(false);

  // Work profile fields
  const [project, setProject]                   = useState(employee.project ?? "");
  const [workerType, setWorkerType]             = useState<WorkerType>(employee.workerType ?? "");
  const [hoursStart, setHoursStart]             = useState(employee.workingHours?.start ?? "");
  const [hoursEnd, setHoursEnd]                 = useState(employee.workingHours?.end ?? "");
  const [extraAuth, setExtraAuth]               = useState(employee.extraHoursAuthorized ?? false);
  const [extraAllowed, setExtraAllowed]         = useState(String(employee.extraHoursAllowed ?? ""));
  const [profileVisible, setProfileVisible]     = useState(employee.showWorkProfile ?? employee.profileVisible ?? false);

  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    // Validate
    if (password.length > 0 && password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (extraAuth && extraAllowed !== "" && Number(extraAllowed) < 0) {
      setError("Las horas extra permitidas deben ser un número no negativo.");
      return;
    }

    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: Record<string, any> = { uid: employee.uid };

      // Account
      if (displayName !== employee.displayName) body.displayName = displayName;
      if (email !== employee.email) body.email = email;
      if (password.length >= 6) body.password = password;

      // Work profile (always send all work-profile fields so admins can clear values)
      body.project             = project;
      body.workerType          = workerType;
      body.workingHoursStart   = hoursStart;
      body.workingHoursEnd     = hoursEnd;
      body.extraHoursAuthorized = extraAuth;
      body.extraHoursAllowed   = extraAllowed !== "" ? Number(extraAllowed) : 0;
      body.profileVisible      = profileVisible;
      body.showWorkProfile     = profileVisible;

      let successMessage = "Perfil del empleado actualizado con éxito.";
      try {
        const res = await fetch("/api/admin/employees", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok && res.status !== 404) {
          const data = await res.json();
          throw new Error(data.error ?? "Error al actualizar");
        }
        if (res.status === 404) {
          throw new Error("404_STATIC");
        }
      } catch (apiErr: unknown) {
        if ((apiErr as Error).message === "404_STATIC" || (apiErr as Error).name === "TypeError") {
          // Static export fallback — update Firestore document directly
          const updateFields: Record<string, any> = {
            displayName,
            email,
            project,
            workerType,
            workingHours: { start: hoursStart, end: hoursEnd },
            extraHoursAuthorized: extraAuth,
            extraHoursAllowed: extraAllowed !== "" ? Number(extraAllowed) : 0,
            profileVisible,
            showWorkProfile: profileVisible,
          };
          await setDoc(doc(db, "users", employee.uid), updateFields, { merge: true });
          if (password.length >= 6) {
            successMessage = "Perfil actualizado. (Nota: El cambio de contraseña requiere backend serverless o restablecimiento por correo en modo estático).";
          }
        } else {
          throw apiErr;
        }
      }

      setSuccess(successMessage);
      setPassword("");
      setTimeout(() => { onSaved(); onClose(); }, 1200);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Error al actualizar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError("");
    setDeleting(true);
    try {
      try {
        const res = await fetch("/api/admin/employees", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: employee.uid }),
        });
        if (!res.ok && res.status !== 404) {
          const data = await res.json();
          throw new Error(data.error ?? "Error al eliminar");
        }
        if (res.status === 404) throw new Error("404_STATIC");
      } catch (apiErr: unknown) {
        if ((apiErr as Error).message === "404_STATIC" || (apiErr as Error).name === "TypeError") {
          await updateDoc(doc(db, "users", employee.uid), { disabled: true });
        } else {
          throw apiErr;
        }
      }
      setSuccess("Usuario deshabilitado. Se conservan los registros de asistencia.");
      setTimeout(() => { onSaved(); onClose(); }, 1500);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Error al eliminar.");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition";

  if (!mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-fade-in"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[88vh] max-h-[760px] my-auto">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {employee.displayName?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{employee.displayName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{employee.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          {([
            { id: "account", label: "Cuenta", icon: <UserIcon size={13} /> },
            { id: "work",    label: "Perfil Laboral", icon: <Briefcase size={13} /> },
          ] as const).map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={[
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors cursor-pointer",
                tab === id
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
              ].join(" ")}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1 min-h-0">

          {/* ── ACCOUNT TAB ── */}
          {tab === "account" && (
            <>
              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  <UserIcon size={12} /> Nombre Completo
                </label>
                <input
                  id="edit-displayname"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nombre y apellido"
                  className={inputCls}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  <Mail size={12} /> Correo / Usuario
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@empresa.com"
                  className={inputCls}
                />
              </div>

              {/* Password Reset */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  <KeyRound size={12} /> Nueva Contraseña{" "}
                  <span className="text-slate-400 dark:text-slate-500 normal-case font-normal">(dejar en blanco para mantener la actual)</span>
                </label>
                <div className="relative">
                  <input
                    id="edit-password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── WORK PROFILE TAB ── */}
          {tab === "work" && (
            <>
              {/* Project */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  <Briefcase size={12} /> Proyecto
                </label>
                <input
                  id="edit-project"
                  type="text"
                  value={project}
                  onChange={(e) => setProject(e.target.value.replace(/[^a-zA-Z0-9\s\-_.#]/g, ""))}
                  placeholder="ej. Proyecto Alfa, Q4-2026"
                  className={inputCls}
                />
                <p className="text-xs text-slate-400 dark:text-slate-500">Se permiten caracteres alfanuméricos, espacios, guiones y puntos.</p>
              </div>

              {/* Worker Type */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  <Building2 size={12} /> Tipo de Trabajador
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {WORKER_TYPE_OPTIONS.map(({ value, label, icon }) => (
                    <button
                      key={value}
                      id={`worker-type-${value}`}
                      type="button"
                      onClick={() => setWorkerType(value)}
                      className={[
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer",
                        workerType === value
                          ? "bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-500/20"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500",
                      ].join(" ")}
                    >
                      <span>{icon}</span> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Working Hours */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  <Timer size={12} /> Horario de Trabajo
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Inicio</p>
                    <input
                      id="edit-hours-start"
                      type="time"
                      value={hoursStart}
                      onChange={(e) => setHoursStart(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div className="mt-5 text-slate-400">—</div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Fin</p>
                    <input
                      id="edit-hours-end"
                      type="time"
                      value={hoursEnd}
                      onChange={(e) => setHoursEnd(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Extra Hours */}
              <div className="space-y-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  <Zap size={12} /> Autorización de Horas Extra
                </label>
                <ToggleSwitch
                  id="extra-hours-auth"
                  checked={extraAuth}
                  onChange={setExtraAuth}
                  label="Autorizar horas extra para este empleado"
                />
                {extraAuth && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Máximo de horas extra aprobadas (por semana)
                    </label>
                    <input
                      id="edit-extra-hours"
                      type="number"
                      min="0"
                      max="40"
                      step="0.5"
                      value={extraAllowed}
                      onChange={(e) => setExtraAllowed(e.target.value)}
                      placeholder="ej. 5"
                      className={inputCls}
                    />
                  </div>
                )}
              </div>

              {/* Profile Visibility */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
                  <MonitorCheck size={12} /> Visibilidad del Empleado
                </label>
                <ToggleSwitch
                  id="profile-visible"
                  checked={profileVisible}
                  onChange={setProfileVisible}
                  label="Mostrar perfil laboral al empleado"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Al habilitar, el empleado podrá ver sus detalles de asignación laboral en su página de perfil.
                </p>
              </div>
            </>
          )}

        </div>

        {/* Fixed Footer Actions */}
        <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 space-y-3">
          {/* Feedback */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl text-rose-700 dark:text-rose-400 text-sm">
              <AlertTriangle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm">
              {success}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              id="save-employee-edit"
              onClick={handleSave}
              disabled={saving || deleting}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : <Save size={15} />}
              {saving ? "Guardando…" : "Guardar Cambios"}
            </button>

            {!confirmDelete ? (
              <button
                id="delete-employee-btn"
                onClick={() => setConfirmDelete(true)}
                disabled={saving || deleting}
                className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={15} /> Deshabilitar
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="confirm-delete-yes"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-3 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {deleting ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : <Trash2 size={14} />}
                  Confirmar
                </button>
                <button
                  id="confirm-delete-no"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {confirmDelete && (
            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-start gap-1.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl px-3 py-2">
              <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
              Esto <strong>deshabilitará</strong> el acceso del usuario. Los registros de asistencia e incidencias se <strong>conservan</strong>.
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function AdminEmployeesPage() {
  const [employees, setEmployees]   = useState<Employee[]>([]);
  const [filtered, setFiltered]     = useState<Employee[]>([]);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [mounted, setMounted]       = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");

      let emps: Employee[] = [];
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        emps = usersSnap.docs.map((d) => ({
          uid: d.id,
          ...(d.data() as Omit<Employee, "uid">),
        }));
      } catch (userErr) {
        console.warn("Could not read users collection directly:", userErr);
      }

      const todayQ = query(collection(db, "attendance"), where("date", "==", today));
      const todaySnap = await getDocs(todayQ);
      const todayDocs = todaySnap.docs
        .map((d) => d.data() as { userId: string; userEmail?: string; userName?: string; eventType: string; timestamp: { seconds: number } })
        .sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0));

      const lastEvents = new Map<string, { eventType: string; timestamp: { seconds: number } }>();
      for (const data of todayDocs) {
        if (!lastEvents.has(data.userId)) {
          lastEvents.set(data.userId, { eventType: data.eventType, timestamp: data.timestamp });
        }
      }

      const empMap = new Map<string, Employee>();
      for (const emp of emps) empMap.set(emp.uid, emp);
      for (const data of todayDocs) {
        if (!empMap.has(data.userId)) {
          empMap.set(data.userId, {
            uid: data.userId,
            displayName: data.userName || data.userEmail?.split("@")[0] || "Empleado",
            email: data.userEmail || "",
            role: "employee",
            createdAt: new Date().toISOString(),
          });
        }
      }

      const allEmps = Array.from(empMap.values());
      const enriched = allEmps.map((emp) => {
        const lastEv = lastEvents.get(emp.uid);
        let todayStatus = "idle";
        if (lastEv) {
          if (lastEv.eventType === "clock_in" || lastEv.eventType === "lunch_in") todayStatus = "clocked_in";
          else if (lastEv.eventType === "lunch_out") todayStatus = "on_lunch";
          else if (lastEv.eventType === "clock_out") todayStatus = "clocked_out";
        }
        return { ...emp, lastEvent: lastEv, todayStatus };
      });

      setEmployees(enriched);
      setFiltered(enriched);
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEmployees(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      employees.filter(
        (e) =>
          e.displayName?.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q) ||
          e.project?.toLowerCase().includes(q)
      )
    );
  }, [search, employees]);

  const isRefreshing = mounted ? loading : false;

  return (
    <AdminShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Empleados</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5" suppressHydrationWarning>
              {employees.length} empleado{employees.length !== 1 ? "s" : ""} registrado{employees.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={loadEmployees}
            disabled={isRefreshing}
            suppressHydrationWarning
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o proyecto…"
            style={{ paddingLeft: "2.5rem" }}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xs"
          />
        </div>

        {/* Employee List */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Users size={36} className="mx-auto mb-3 opacity-40" />
            <p>{search ? "Ningún empleado coincide con tu búsqueda." : "Aún no hay empleados registrados."}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((emp) => {
              const statusCfg = statusLabels[emp.todayStatus ?? "idle"];
              const wtLabel = emp.workerType ? WORKER_TYPE_LABELS[emp.workerType] : null;
              return (
                <div
                  key={emp.uid}
                  className="flex items-center gap-4 px-4 py-3.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {emp.displayName?.[0]?.toUpperCase() ?? "?"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-200 truncate">{emp.displayName}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Mail size={11} />
                        <span className="truncate">{emp.email}</span>
                      </div>
                      {wtLabel && (
                        <span className="text-xs px-1.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400 font-medium">
                          {wtLabel}
                        </span>
                      )}
                      {emp.project && (
                        <span className="text-xs px-1.5 py-0.5 rounded-md bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-400 font-medium truncate max-w-[120px]">
                          {emp.project}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status + time + edit */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {emp.lastEvent && (
                      <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Clock size={11} />
                        {format(new Date(emp.lastEvent.timestamp.seconds * 1000), "HH:mm")}
                      </div>
                    )}
                    <Badge variant={statusCfg.variant} dot>
                      {statusCfg.label}
                    </Badge>
                    {/* Edit button */}
                    <button
                      id={`edit-emp-${emp.uid}`}
                      onClick={() => setEditTarget(emp)}
                      title={`Editar ${emp.displayName}`}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Pencil size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <EditEmployeeModal
          employee={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={loadEmployees}
        />
      )}
    </AdminShell>
  );
}
