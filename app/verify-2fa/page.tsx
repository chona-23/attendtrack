"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, AlertCircle } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { verifyTOTPClient } from "@/lib/totp";

export default function Verify2FAPage() {
  const { user, loading: authLoading, set2FAVerified, signOut } = useAuth();
  const router = useRouter();

  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user && !authLoading) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      router.replace("/login");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (token.length !== 6 || !/^\d{6}$/.test(token)) {
      setError("Por favor ingrese un código válido de 6 dígitos.");
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    try {
      let verified = false;

      // 1. Attempt server-side verification first
      try {
        const res = await fetch("/api/auth/verify-totp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.uid, token }),
        });

        if (res.ok) {
          verified = true;
        } else if (res.status === 401) {
          const data = await res.json();
          setError(data.error ?? "Código inválido. Intente nuevamente.");
          setLoading(false);
          return;
        }
      } catch (fetchErr) {
        console.warn("Server-side 2FA check skipped, falling back to client:", fetchErr);
      }

      // 2. Client-side fallback if server-side Admin SDK is not configured
      if (!verified) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists() || !userDoc.data()?.totpSecret) {
          setError("2FA no está configurado en esta cuenta. Configúrelo primero.");
          setLoading(false);
          return;
        }

        const valid = verifyTOTPClient(token, userDoc.data().totpSecret);
        if (!valid) {
          setError("Código inválido. Verifique su aplicación e intente de nuevo.");
          setLoading(false);
          return;
        }
      }

      set2FAVerified(true);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Verification error:", err);
      setError("Verificación fallida. Intente nuevamente.");
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
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center mx-auto mb-4">
            <Shield size={26} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Autenticación de Dos Factores</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Abre tu aplicación de autenticación e ingresa el código de 6 dígitos
          </p>
        </div>

        <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-xl dark:shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4" id="verify-2fa-form">
            <div>
              <label htmlFor="totp-code" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-center">
                Código de Seguridad (6 Dígitos)
              </label>
              <Input
                id="totp-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="text-center text-2xl tracking-[0.5em] font-mono py-3"
                autoFocus
                autoComplete="one-time-code"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-sm">
                <AlertCircle size={15} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              id="verify-2fa-submit"
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white !rounded-xl"
            >
              Verificar Código
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10 text-center">
            <button
              type="button"
              id="cancel-sign-out"
              onClick={handleSignOut}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              ← Cancelar y Cerrar Sesión
            </button>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-4">
          Los códigos se actualizan cada 30 segundos. Compatible con Microsoft Authenticator y Google Authenticator.
        </p>
      </div>
    </div>
  );
}
