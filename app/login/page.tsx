"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Flame, LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check role from profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Profile Fetch Error:", profileError);
      }

      // Explicit check for the known admin email as a fallback or the profile role
      if (profile?.role === "admin" || data.user.email === "sidagas.service@gmail.com") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/agen");
      }
    } catch (err: any) {
      setError(err.message || "Kredensial tidak valid. Silakan periksa kembali email dan password Anda.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-[440px] w-full space-y-8"
      >
        <div className="text-center space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="bg-primary-600 p-2 rounded-lg shadow-sm">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-neutral-900 tracking-tighter">
              SiDagas
            </span>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-neutral-900">Portal Akses Mitra</h1>
            <p className="text-neutral-500 font-medium text-sm">Masuk untuk mengelola distribusi gas subsidi.</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-strong border border-neutral-200">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[12px] font-black uppercase tracking-widest text-neutral-400 ml-1">E-mail Resmi</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 px-11 py-3.5 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-sm font-medium"
                  placeholder="admin@sidagas.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[12px] font-black uppercase tracking-widest text-neutral-400">Kata Sandi</label>
                <button type="button" className="text-[10px] font-bold text-primary-600 hover:underline">Lupa sandi?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 px-11 py-3.5 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-sm font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 italic text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-soft flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Verifikasi & Masuk</span>
                  <LogIn className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
          Sistem Monitoring Tersertifikasi © 2026
        </p>
      </motion.div>
    </div>
  );
}
