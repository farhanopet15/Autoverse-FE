"use client";

import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";

function cn2(...args: Array<string | undefined | false | null>) {
  return args.filter(Boolean).join(" ");
}

function MagicCard2({
  children,
  className,
  gradientSize = 220,
  gradientColor = "#0a0a0a",
  gradientOpacity = 0.8,
  gradientFrom = "#D4AF37",
  gradientTo = "#C99700",
}: {
  children?: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
}) {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);
  const reset = useCallback(() => { mouseX.set(-gradientSize); mouseY.set(-gradientSize); }, [gradientSize, mouseX, mouseY]);
  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - r.left); mouseY.set(e.clientY - r.top);
  }, [mouseX, mouseY]);
  useEffect(() => { reset(); }, [reset]);
  useEffect(() => {
    const out = (e: PointerEvent) => { if (!(e as any).relatedTarget) reset(); };
    const vis = () => { if (document.visibilityState !== "visible") reset(); };
    window.addEventListener("pointerout", out as any); window.addEventListener("blur", reset); document.addEventListener("visibilitychange", vis);
    return () => { window.removeEventListener("pointerout", out as any); window.removeEventListener("blur", reset); document.removeEventListener("visibilitychange", vis); };
  }, [reset]);

  return (
    <div
      className={cn2(
        "group relative rounded-2xl border border-zinc-800/60 backdrop-blur",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
        className
      )}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onPointerEnter={reset}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-80 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientFrom}, ${gradientTo}, rgba(18,18,18,0.3) 100%)`,
          maskImage: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
          WebkitMaskComposite: "xor",
          // @ts-ignore
          maskComposite: "exclude",
          padding: 1,
        }}
      />
      <div className="relative rounded-2xl bg-neutral-900/70 supports-[backdrop-filter]:bg-neutral-900/50 p-6 shadow-xl">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 70%)`,
            opacity: gradientOpacity,
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.replace("/dashboard"); router.refresh();
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-black via-neutral-950 to-black text-neutral-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full blur-3xl opacity-20 bg-amber-400/70" />
        <div className="absolute -bottom-48 right-1/3 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-10 bg-yellow-500/60" />
        <div className="absolute -left-1/2 top-1/3 h-[1px] w-[200%] -rotate-12 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
        <div className="absolute inset-0 bg-[url('/luxury-carbon.png')] bg-[length:600px_600px] opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:3px_3px]" />
      </div>

      <MagicCard2 className="w-full max-w-md mx-auto">
        <form onSubmit={onSubmit} className="w-full" autoComplete="on">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-amber-300/90">Masuk</h2>
            <p className="text-sm text-neutral-300 mt-1">Belum punya akun? <a href="/register" className="underline underline-offset-4 text-amber-200 hover:text-amber-300">Daftar</a></p>
          </div>

          <label className="block text-sm font-medium text-neutral-200">Email</label>
          <input
            className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-2.5 text-neutral-100 shadow-sm outline-none ring-0 placeholder-neutral-500 focus:border-amber-500/60 focus:bg-neutral-900"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral-200">Password</label>
            <div className="mt-1 relative">
              <input
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-2.5 pr-11 text-neutral-100 shadow-sm outline-none ring-0 placeholder-neutral-500 focus:border-amber-500/60"
                placeholder="••••••••"
                type={showPass?"text":"password"}
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={()=>setShowPass(s=>!s)}
                className="absolute inset-y-0 right-2 my-auto rounded-lg px-2 text-xs text-neutral-300 hover:bg-neutral-800/70"
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-neutral-300">
              <label className="inline-flex items-center gap-2 select-none"><input type="checkbox" className="accent-amber-500" /> Ingat saya</label>
              <a href="/forgot-password" className="underline underline-offset-4 text-amber-200 hover:text-amber-300">Lupa password?</a>
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-400/90 bg-red-900/20 border border-red-800/50 rounded-xl px-3 py-2">{error}</p>}

          <button
            disabled={loading}
            className={cn2(
              "mt-6 w-full rounded-xl py-2.5 font-medium text-black shadow-lg transition active:scale-[0.99]",
              "bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400",
              "hover:from-amber-200 hover:via-yellow-300 hover:to-amber-300",
              "shadow-[0_10px_30px_-12px_rgba(234,179,8,0.5)]",
              loading && "opacity-70 cursor-not-allowed"
            )}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2 text-neutral-900">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg> Masuk...
              </span>
            ) : "Masuk"}
          </button>
        </form>
      </MagicCard2>

      <footer className="absolute bottom-4 w-full text-center text-xs text-neutral-400">© {new Date().getFullYear()} Autoverse — Semua hak dilindungi.</footer>
    </main>
  );
}