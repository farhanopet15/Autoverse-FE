"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import LogoutButton from "@/components/LogoutButton";
import type { User } from "@supabase/supabase-js";

type Theme = "dark" | "light";
type AiData = {
  title: string;
  summary: string;
  tags?: string[];
  facts?: string[];
  categories?: { title: string; items: string[] }[];
  imageUrl?: string;
};

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>("User");
  const [theme, setTheme] = useState<Theme>("dark");

  // === state untuk AI generate ===
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genData, setGenData] = useState<AiData | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      }: { data: { user: User | null } } = await supabase.auth.getUser();

      const name =
        (user?.user_metadata?.full_name as string | undefined) ??
        (user?.email as string | undefined) ??
        "User";
      setUserName(name);
    })();
  }, []);

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? "";
  }

  async function onGenerate() {
    setGenLoading(true);
    setGenError(null);
    setGenData(null);
    setOpenModal(true);
    setSaveMsg(null);

    try {
      const token = await getToken();
      let res: Response;

      if (file) {
        const form = new FormData();
        form.append("desc", title);
        form.append("image", file);
        res = await fetch(`${apiBase}/api/ai/describe`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
      } else {
        res = await fetch(`${apiBase}/api/ai/describe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ desc: title }),
        });
      }

      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      const data: AiData = {
        title: json?.data?.title ?? "Hasil",
        summary:
          json?.data?.summary ?? json?.data?.text ?? JSON.stringify(json?.data ?? json),
        tags: json?.data?.tags ?? [],
        facts: json?.data?.facts ?? [],
        categories: json?.data?.categories ?? [],
        imageUrl: json?.data?.imageUrl,
      };
      setGenData(data);
    } catch (e: any) {
      setGenError(e?.message ?? "Gagal generate");
    } finally {
      setGenLoading(false);
    }
  }

  async function onSave() {
    if (!genData) return;
    setSaveLoading(true);
    setSaveMsg(null);
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/ideas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: genData.title,
          summary: genData.summary,
          tags: genData.tags ?? [],
          facts: genData.facts ?? [],
          categories: genData.categories ?? [],
          imageUrl: genData.imageUrl ?? null,
          source: "ai-generate",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSaveMsg("✅ Tersimpan ke Koleksi");
    } catch (e: any) {
      setSaveMsg(`❌ Gagal menyimpan: ${e?.message ?? ""}`);
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <main
      className={`relative min-h-screen transition-colors duration-500 ${
        theme === "dark" ? "bg-black text-white" : "bg-zinc-50 text-zinc-900"
      }`}
    >
      {/* === VIDEO BG START === */}
      <VideoBackground
        srcMp4="/Tofuya.mp4"
        // srcWebm="/bg.webm"
        // poster="/bg-poster.jpg"
        theme={theme}
      />
      {/* === VIDEO BG END === */}

      {/* Navbar */}
      <nav
        className={`flex items-center justify-between px-6 py-4 sticky top-0 z-20 backdrop-blur border-b ${
          theme === "dark" ? "border-amber-200/10 bg-black/40" : "border-amber-600/10 bg-white/70"
        }`}
      >
        <h1 className="font-bold text-lg tracking-wide">
          <a href="/dashboard" className="text-amber-300/90">AutoVerse</a>
        </h1>
        <div className="flex items-center gap-3">
          <a href="/ideas" className="text-sm underline opacity-85 hover:opacity-100">
            Koleksi
          </a>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`px-3 py-1.5 rounded-md border text-sm transition ${
              theme === "dark" ? "border-white/20 hover:bg-white/10" : "border-black/10 hover:bg-black/5"
            }`}
          >
            {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
          </button>
          <span className="text-sm opacity-85">{userName}</span>
          <LogoutButton variant={theme === "dark" ? "dark" : "light"} />
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12 text-center">
        <h2 className="text-4xl font-extrabold mb-6 tracking-wide text-amber-300/90">
          CARI INSPIRASI OTOMOTIF
        </h2>

        {/* FORM */}
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          {/* input judul */}
          <input
            type="text"
            placeholder="Masukkan judul (contoh: Mitsubishi Evo IX, HKS)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full rounded-xl px-4 py-3 text-center transition focus:outline-none
              ${
                theme === "dark"
                  ? "border border-white/20 bg-white/10 placeholder-white/70 focus:ring-2 focus:ring-amber-400/50"
                  : "border border-black/15 bg-white placeholder-zinc-600 shadow-sm focus:ring-2 focus:ring-amber-400/50"
              }`}
          />

          {/* upload foto */}
          <label
            className={`w-full text-sm font-medium cursor-pointer flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-6 border border-dashed transition group
              ${
                theme === "dark"
                  ? "border-amber-200/30 bg-white/10 hover:bg-white/15"
                  : "border-amber-500/30 bg-white hover:bg-amber-50 shadow-sm"
              }`}
          >
            <span className={`text-2xl ${theme === "dark" ? "text-amber-300/80" : "text-amber-600"}`}>⬆️</span>
            <span className={theme === "dark" ? "" : "text-zinc-800"}>{file ? file.name : "Upload Foto"}</span>
            <span className={`text-xs ${theme === "dark" ? "text-white/60" : "text-zinc-600"}`}>JPG/PNG, max 5MB</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          {/* tombol generate */}
          <button
            onClick={onGenerate}
            disabled={genLoading}
            className={`w-full rounded-xl font-semibold py-3 transition disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${
                theme === "dark"
                  ? "bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 text-black hover:from-amber-200 hover:to-amber-300 shadow-[0_10px_30px_-12px_rgba(234,179,8,0.5)] focus:ring-amber-400/50 focus:ring-offset-zinc-900"
                  : "bg-gradient-to-r from-amber-400 to-yellow-400 text-black hover:from-amber-300 hover:to-yellow-300 shadow focus:ring-amber-400/60 focus:ring-offset-white"
              }`}
          >
            {genLoading ? "Menghasilkan..." : "Generate AI"}
          </button>
        </div>

        {/* Cards bawah */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 w-full max-w-5xl">
          {[
            {
              title: "🤖 Asisten Kendaraan Cerdas",
              desc: "AI kami membantu Anda mengelola mobil dan motor secara otomatis. Simpan data kendaraan, dokumen penting, dan informasi teknis dalam satu sistem pintar yang selalu siap membantu.",
            },
            {
              title: "🧠 Analisis & Riwayat Perawatan",
              desc: "Pantau performa dan kondisi kendaraan dengan kecerdasan buatan. Dapatkan insight dari riwayat servis, suku cadang, hingga estimasi biaya perawatan yang dipersonalisasi.",
            },
            {
              title: "⚙️ Pengingat Prediktif Otomatis",
              desc: "Bukan sekadar pengingat biasa — AI kami memprediksi kapan oli perlu diganti, servis dilakukan, atau ban harus dirotasi. Semua agar kendaraan Anda selalu dalam performa terbaik.",
            },
          ].map((card, i) => (
            <div
              key={i}
              className={`rounded-xl p-6 transition hover:scale-[1.02] backdrop-blur
                ${
                  theme === "dark"
                    ? "border border-amber-200/20 bg-white/10"
                    : "border border-amber-600/10 bg-white shadow-sm"
                }`}
            >
              <h3 className="font-semibold text-lg mb-2 text-amber-300/90">{card.title}</h3>
              <p className="text-sm opacity-90">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      <Modal
        open={openModal}
        onClose={() => !genLoading && setOpenModal(false)}
        theme={theme}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-bold">
            {genLoading ? "Menghasilkan…" : genData?.title ?? "Hasil Generate"}
          </h3>
          <div className="flex items-center gap-2">
            {!genLoading && genData ? (
              <button
                onClick={onSave}
                disabled={saveLoading}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                  theme === "dark" ? "bg-white text-black hover:opacity-90" : "bg-amber-500 text-black hover:bg-amber-400"
                }`}
              >
                {saveLoading ? "Menyimpan…" : "Simpan ke Koleksi"}
              </button>
            ) : null}
            <button
              onClick={() => !genLoading && setOpenModal(false)}
              className={`rounded-md px-3 py-1.5 text-sm border transition ${
                theme === "dark" ? "hover:bg-white/10 border-white/20" : "hover:bg-black/5 border-black/10"
              }`}
              disabled={genLoading}
            >
              Tutup
            </button>
          </div>
        </div>

        {saveMsg && (
          <div className="mt-2 text-sm">
            {saveMsg.startsWith("✅") ? (
              <span className="text-emerald-600 dark:text-emerald-400">{saveMsg}</span>
            ) : (
              <span className="text-red-700 dark:text-red-300">{saveMsg}</span>
            )}
          </div>
        )}

        {/* Body */}
        {genLoading && (
          <div className="mt-4 space-y-3 animate-pulse">
            <div className="h-4 rounded bg-current/20" />
            <div className="h-4 rounded bg-current/10 w-5/6" />
            <div className="h-4 rounded bg-current/10 w-4/6" />
            <div className="h-40 rounded bg-current/10" />
          </div>
        )}

        {!genLoading && genError && (
          <div
            className={`mt-4 rounded-md p-3 text-sm border ${
              theme === "dark"
                ? "border-red-500/40 bg-red-500/10 text-red-200"
                : "border-red-400/50 bg-red-50 text-red-700"
            }`}
          >
            {genError}
          </div>
        )}

        {!genLoading && genData && (
          <div className="mt-4 grid md:grid-cols-5 gap-5">
            {/* preview kiri */}
            <div className="md:col-span-2">
              {genData.imageUrl ? (
                <img
                  src={genData.imageUrl}
                  alt="preview"
                  className={`w-full rounded-lg object-cover border ${
                    theme === "dark" ? "border-white/15" : "border-black/10"
                  }`}
                />
              ) : (
                <div
                  className={`w-full h-40 rounded-lg flex items-center justify-center text-xs opacity-70 border ${
                    theme === "dark" ? "bg-white/5 border-white/15" : "bg-black/[.03] border-black/10"
                  }`}
                >
                  Tidak ada gambar
                </div>
              )}

              {genData.tags?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {genData.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 rounded border ${
                        theme === "dark" ? "border-white/20 bg-white/5" : "border-black/10 bg-black/[.04]"
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {/* detail kanan */}
            <div className="md:col-span-3 space-y-4">
              <p className="text-sm opacity-90 whitespace-pre-wrap">{genData.summary}</p>

              {genData.facts?.length ? (
                <div>
                  <h4 className="font-semibold mb-1">Fakta</h4>
                  <ul className="list-disc pl-5 text-sm opacity-90 space-y-1">
                    {genData.facts.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {genData.categories?.length ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {genData.categories.slice(0, 3).map((c, i) => (
                    <div
                      key={i}
                      className={`rounded-lg p-3 border ${
                        theme === "dark" ? "bg-white/5 border-white/15" : "bg-black/[.03] border-black/10"
                      }`}
                    >
                      <h5 className="font-semibold">{c.title}</h5>
                      <ul className="mt-1 list-disc pl-5 text-sm opacity-90 space-y-0.5">
                        {c.items.map((it, j) => (
                          <li key={j}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}

/* ================= Modal ================= */
function Modal({
  open,
  onClose,
  children,
  theme = "dark" as Theme,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  theme?: Theme;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className={`absolute inset-0 ${theme === "dark" ? "bg-black/70" : "bg-black/40"} backdrop-blur-sm`} />
      <div
        className={`relative max-w-5xl w-full rounded-2xl p-5 shadow-2xl border`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme === "dark" ? "#18181b" : "#ffffff",
          color: theme === "dark" ? "white" : "#0a0a0a",
          borderColor: theme === "dark" ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ================= Video Background (audio dari video) ================= */
function VideoBackground({
  srcMp4 = "/bg.mp4",
  srcWebm,
  poster,
  theme,
}: {
  srcMp4?: string;
  srcWebm?: string;
  poster?: string;
  theme: "dark" | "light";
}) {
  const [soundOn, setSoundOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("videoSoundOn") : null;
    if (saved) setSoundOn(saved === "true");
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (soundOn) {
      v.muted = false;
      v.play().catch(() => {});
    } else {
      v.muted = true;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("videoSoundOn", String(soundOn));
    }
  }, [soundOn]);

  const toggleSound = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (!soundOn) {
        v.muted = false;
        await v.play();
        setSoundOn(true);
      } else {
        v.muted = true;
        setSoundOn(false);
      }
    } catch {
    }
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* === VIDEO BG START === */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
        preload="none"
      >
        {srcWebm ? <source src={srcWebm} type="video/webm" /> : null}
        <source src={srcMp4} type="video/mp4" />
        Browser kamu tidak mendukung video background.
      </video>
      {/* === VIDEO BG END === */}

      {/* Overlay agar konten kontras */}
      <div className={`pointer-events-none absolute inset-0 ${theme === "dark" ? "bg-black/55" : "bg-white/35"}`} />

      {/* Vignette halus */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(120% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.25) 100%)",
          mixBlendMode: theme === "dark" ? ("normal" as any) : ("multiply" as any),
        }}
      />

      {/* Tombol Unmute/Mute */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
        <button
          onClick={toggleSound}
          className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium backdrop-blur border transition
            ${theme === "dark"
              ? "bg-black/40 border-white/20 text-white hover:bg-black/55"
              : "bg-white/70 border-black/10 text-black hover:bg-white/90"}`}
          title={soundOn ? "Matikan suara" : "Hidupkan suara"}
        >
          {soundOn ? "🔊 Unmuted" : "🔈 Unmute"}
        </button>
      </div>

      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          video { animation: none !important; }
        }
      `}</style>
    </div>
  );
}