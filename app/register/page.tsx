"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Building2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      router.push("/setup-2fa");
    } catch (err: unknown) {
      console.error("Sign up error:", err);
      const fbErr = err as { code?: string; message?: string };
      const code = fbErr?.code;
      if (code === "auth/email-already-in-use") {
        setError("Ya existe una cuenta registrada con este correo.");
      } else if (code === "auth/weak-password") {
        setError("La contraseña es muy débil. Utilice al menos 8 caracteres.");
      } else if (code === "auth/operation-not-allowed") {
        setError("El registro con correo y contraseña no está habilitado.");
      } else if (code === "auth/configuration-not-found") {
        setError("La autenticación no está configurada correctamente.");
      } else if (code === "auth/network-request-failed") {
        setError("Error de red al conectar con el servidor. Verifique su conexión a internet.");
      } else if (code === "permission-denied") {
        setError("Permiso denegado para registrar usuario.");
      } else {
        setError(`Error en el registro: ${fbErr?.message || code || "Intente nuevamente."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-slate-900 dark:via-[#1e293b] dark:to-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/20">
            <Building2 size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AttendTrack</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Crea tu cuenta de empleado</p>
        </div>

        <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-xl dark:shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Registro de Nuevo Empleado</h2>

          <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
            <Input
              id="register-name"
              label="Nombre completo"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              icon={<User size={16} />}
              required
            />

            <Input
              id="register-email"
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@empresa.com"
              icon={<Mail size={16} />}
              required
              autoComplete="email"
            />

            <div className="relative">
              <Input
                id="register-password"
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                icon={<Lock size={16} />}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bottom-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Input
              id="register-confirm-password"
              label="Confirmar contraseña"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              icon={<Lock size={16} />}
              className="pr-10"
              required
            />

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-sm">
                <AlertCircle size={15} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              id="register-submit"
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white !rounded-xl"
            >
              Crear Cuenta
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
