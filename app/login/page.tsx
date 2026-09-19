"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { needs2FASetup } = await signIn(email, password);
      if (needs2FASetup) {
        router.push("/setup-2fa");
      } else {
        router.push("/verify-2fa");
      }
    } catch (err: unknown) {
      console.error("Sign in error:", err);
      const fbErr = err as { code?: string; message?: string };
      const code = fbErr?.code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else if (code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (code === "auth/operation-not-allowed") {
        setError("Email/Password sign-in is not enabled in Firebase Console.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else if (code === "auth/network-request-failed") {
        setError("Network error connecting to Firebase.");
      } else {
        setError(`Sign in failed: ${fbErr?.message || code || "Please try again."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1e293b] to-slate-800 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 shadow-xl shadow-blue-500/30">
            <Image
              src="/icon.png"
              alt="AttendTrack Logo"
              width={64}
              height={64}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-white">AttendTrack</h1>
          <p className="text-slate-400 text-sm mt-1">Enterprise Attendance System</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Employee Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            <Input
              id="login-email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              admin
              icon={<Mail size={16} />}
              required
              autoComplete="email"
            />

            <div className="relative">
              <Input
                id="login-password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                admin
                icon={<Lock size={16} />}
                className="pr-10"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bottom-2.5 text-slate-400 hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
                <AlertCircle size={15} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              id="login-submit"
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              className="mt-2 bg-blue-600 hover:bg-blue-700 !rounded-xl"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-slate-400 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Register
              </Link>
            </p>
            <p className="text-slate-600 text-xs mt-3">
              Administrator?{" "}
              <Link href="/admin/login" className="text-slate-400 hover:text-slate-300 transition-colors">
                Admin Console →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
