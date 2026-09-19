"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import { Shield, Smartphone, CheckCircle2, AlertCircle, Copy, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { generateTOTPSecret, buildOTPAuthURI, verifyTOTPClient } from "@/lib/totp";

type Step = "generate" | "scan" | "verify" | "done";

export default function Setup2FAPage() {
  const { user, profile, set2FAVerified } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("generate");
  const [secret, setSecret] = useState("");
  const [otpUri, setOtpUri] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    const storageKey = `attendtrack_totp_${user.uid}`;
    let s = sessionStorage.getItem(storageKey);
    if (!s) {
      s = generateTOTPSecret();
      sessionStorage.setItem(storageKey, s);
    }
    setSecret(s);
    const userEmail = profile?.email || user.email || "employee@attendtrack.com";
    setOtpUri(buildOTPAuthURI(s, userEmail, "AttendTrack"));
  }, [user, profile, router]);

  const handleResetSecret = () => {
    if (!user) return;
    const storageKey = `attendtrack_totp_${user.uid}`;
    const newSecret = generateTOTPSecret();
    sessionStorage.setItem(storageKey, newSecret);
    setSecret(newSecret);
    const userEmail = profile?.email || user.email || "employee@attendtrack.com";
    setOtpUri(buildOTPAuthURI(newSecret, userEmail, "AttendTrack"));
    setError("");
    setToken("");
    setStep("scan");
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const copyAccount = async (account: string) => {
    await navigator.clipboard.writeText(account);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (token.length !== 6 || !/^\d{6}$/.test(token)) {
      setError("Por favor ingrese un código válido de 6 dígitos.");
      return;
    }

    setLoading(true);
    try {
      const valid = verifyTOTPClient(token, secret);
      if (!valid) {
        setError(
          "Código inválido. Si tu aplicación ya tiene una entrada previa de AttendTrack, elimínala, presiona 'Reiniciar y Generar Nuevo QR' e intenta de nuevo."
        );
        setLoading(false);
        return;
      }

      // Save secret to Firestore using setDoc with merge: true
      await setDoc(
        doc(db, "users", user!.uid),
        {
          uid: user!.uid,
          email: user!.email,
          displayName: profile?.displayName || user!.displayName || user!.email?.split("@")[0] || "Employee",
          totpSecret: secret,
          totpEnabled: true,
          totpSetupAt: new Date().toISOString(),
          role: profile?.role || "employee",
          createdAt: profile?.createdAt || new Date().toISOString(),
        },
        { merge: true }
      );

      // Clear pending secret from sessionStorage
      sessionStorage.removeItem(`attendtrack_totp_${user!.uid}`);

      set2FAVerified(true);
      setStep("done");

      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: unknown) {
      console.error(err);
      const errMsg = (err as Error)?.message || "Error en la configuración. Intente de nuevo.";
      setError(`Error en la configuración: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-slate-900 dark:via-[#1e293b] dark:to-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 transition-colors duration-200">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-500 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">¡2FA Habilitado!</h2>
          <p className="text-slate-600 dark:text-slate-400">Redirigiendo a tu panel principal…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-slate-900 dark:via-[#1e293b] dark:to-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center mx-auto mb-4">
            <Shield size={26} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Configurar Autenticación de Dos Factores</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Requerido para la seguridad de tu cuenta</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {["Escanear QR", "Verificar Código"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={[
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  (step === "scan" && i === 0) || (step === "verify" && i === 1)
                    ? "bg-blue-600 text-white"
                    : step === "verify" && i === 0
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
                ].join(" ")}
              >
                {step === "verify" && i === 0 ? "✓" : i + 1}
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400">{label}</span>
              {i === 0 && <span className="text-slate-400 dark:text-slate-600 mx-1">→</span>}
            </div>
          ))}
        </div>

        <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl dark:shadow-2xl">
          {step === "generate" && (
            <div className="text-center space-y-4">
              <Smartphone size={48} className="text-blue-600 dark:text-blue-400 mx-auto" />
              <div>
                <h3 className="text-slate-900 dark:text-white font-semibold mb-2">Instala una Aplicación de Autenticación</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Descarga <strong className="text-slate-200">Microsoft Authenticator</strong> o{" "}
                  <strong className="text-slate-200">Google Authenticator</strong> en tu teléfono.
                </p>
              </div>
              <Button
                id="setup-2fa-continue"
                fullWidth
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 !rounded-xl"
                onClick={() => setStep("scan")}
              >
                Continuar
              </Button>
            </div>
          )}

          {step === "scan" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-1">Escanea el Código QR</h3>
                <p className="text-slate-400 text-sm">
                  Abre tu aplicación de autenticación y escanea el código mostrado a continuación.
                </p>
              </div>

              {/* Microsoft Authenticator Specific Guidance */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-xs text-slate-300">
                <p className="font-semibold text-blue-400 flex items-center gap-1.5 mb-1">
                  <span>📱</span> Aplicación Microsoft Authenticator:
                </p>
                <p>
                  En Microsoft Authenticator, presiona <strong className="text-white">+ (Agregar cuenta)</strong> &rarr; selecciona <strong className="text-blue-300">&quot;Otra (Google, Facebook, etc.)&quot;</strong>.
                </p>
                <p className="text-slate-400 text-[11px] mt-1">
                  <em>Nota: No selecciones &quot;Cuenta laboral o escolar&quot;.</em>
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center my-2">
                <div className="bg-white p-3.5 rounded-2xl shadow-lg inline-block">
                  {otpUri && (
                    <QRCodeSVG
                      value={otpUri}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  )}
                </div>
              </div>

              {/* Manual entry */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-3">
                <p className="text-slate-400 text-xs font-medium">
                  ¿No puedes escanear? Ingresa manualmente en <strong className="text-slate-200">&quot;Otra&quot; &rarr; &quot;O ingresar código manualmente&quot;</strong>:
                </p>

                {/* Account Name */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Nombre de Cuenta:</label>
                  <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 rounded-lg px-2.5 py-1.5">
                    <code className="flex-1 text-xs text-slate-200 font-mono truncate">
                      {profile?.email || user?.email || "AttendTrack"}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyAccount(profile?.email || user?.email || "AttendTrack")}
                      className="text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0 cursor-pointer"
                      title="Copiar nombre de cuenta"
                    >
                      {copiedAccount ? (
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Secret Key */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Clave Secreta (Base32):</label>
                  <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 rounded-lg px-2.5 py-1.5">
                    <code className="flex-1 text-xs text-amber-300 font-mono tracking-wider break-all select-all">
                      {secret}
                    </code>
                    <button
                      type="button"
                      onClick={copySecret}
                      className="text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0 cursor-pointer"
                      title="Copiar clave secreta"
                    >
                      {copiedKey ? (
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                id="setup-2fa-scanned"
                fullWidth
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 !rounded-xl mt-2 cursor-pointer"
                onClick={() => setStep("verify")}
              >
                Ya lo agregué &rarr; Siguiente
              </Button>
            </div>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerify} className="space-y-5" id="verify-setup-form">
              <div>
                <h3 className="text-white font-semibold mb-1">Ingresar Código de Verificación</h3>
                <p className="text-slate-400 text-sm">
                  Ingresa el código de 6 dígitos mostrado en tu aplicación para confirmar la configuración.
                </p>
              </div>

              <Input
                id="setup-totp-token"
                label="Código de 6 dígitos"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                admin
                className="text-center text-2xl tracking-[0.5em] font-mono"
              />

              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                id="setup-2fa-verify"
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                className="bg-emerald-600 hover:bg-emerald-700 !rounded-xl"
              >
                Verificar y Habilitar 2FA
              </Button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => { setStep("scan"); setError(""); setToken(""); }}
                  className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  ← Volver al código QR
                </button>
                <button
                  type="button"
                  onClick={handleResetSecret}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw size={12} />
                  Reiniciar y Generar Nuevo QR
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
