"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import LogoutButton from "@/components/LogoutButton";
import type { User } from "@supabase/supabase-js";

type Theme = "dark" | "light";
type Idea = {
  id: string;
  title: string;
  summary: string;
  tags: string[] | null;
  facts: string[] | null;
  categories: { title: string; items: string[] }[] | null;
  image_url?: string | null;
  created_at: string;
};

export default function IdeasPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [userName, setUserName] = useState("User");
  const [items, setItems] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

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
        user?.email ??
        "User";
      setUserName(name);
    })();
  }, []);

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? "";
  }

  async function fetchIdeas() {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/ideas`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const json = await res.json();
      setItems(json?.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIdeas();
  }, []);

  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState<Idea | null>(null);

  async function onDelete(id: string) {
    if (!confirm("Yakin mau hapus ide ini?")) return;

    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/ideas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Gagal menghapus data.");
      }

      setItems((prev) => prev.filter((it) => it.id !== id));

      setOpenModal(false);
      setSelected((prev) => (prev?.id === id ? null : prev));
    } catch (e: any) {
      alert(e?.message || "Terjadi kesalahan saat menghapus.");
    }
  }

  return (
    <main
      className={`relative min-h-screen ${
        theme === "dark" ? "bg-black text-white" : "bg-zinc-50 text-zinc-900"
      }`}
    >
      {/* === VIDEO BG START === */}
      <VideoBackground srcMp4="/Tofuya.mp4" theme={theme} />
      {/* === VIDEO BG END === */}

      {/* NAVBAR */}
      <nav
        className={`flex items-center justify-between px-6 py-4 sticky top-0 z-20 backdrop-blur border-b ${
          theme === "dark"
            ? "border-amber-200/10 bg-black/40"
            : "border-amber-600/10 bg-white/70"
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-lg tracking-wide">
          <a href="/dashboard" className="text-amber-300/90">
            AutoVerse
          </a>
          <span className="opacity-70 text-sm">/ Koleksi</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`px-3 py-1.5 rounded-md border text-sm transition ${
              theme === "dark"
                ? "border-white/20 hover:bg-white/10"
                : "border-black/10 hover:bg-black/5"
            }`}
          >
            {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
          </button>
          <span className="text-sm opacity-85">{userName}</span>
          <LogoutButton variant={theme === "dark" ? "dark" : "light"} />
        </div>
      </nav>

      {/* CONTENT */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari judul atau tag..."
            className={`w-full md:w-96 rounded-lg px-4 py-2 text-sm focus:outline-none ${
              theme === "dark"
                ? "bg-white/10 border border-white/20 placeholder-white/60"
                : "bg-white border border-black/10 placeholder-zinc-500"
            }`}
          />
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-xl bg-white/10 border border-white/20"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 opacity-75">
            Belum ada koleksi. Coba generate dulu di dashboard.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {items
              .filter(
                (it) =>
                  it.title.toLowerCase().includes(q.toLowerCase()) ||
                  it.tags?.some((t) =>
                    t.toLowerCase().includes(q.toLowerCase())
                  )
              )
              .map((it) => (
                <article
                  key={it.id}
                  className={`rounded-xl p-4 transition hover:scale-[1.02] backdrop-blur ${
                    theme === "dark"
                      ? "border border-amber-200/20 bg-white/10"
                      : "border border-amber-600/10 bg-white shadow-sm"
                  }`}
                >
                  {it.image_url ? (
                    <img
                      src={it.image_url}
                      alt={it.title}
                      className="h-36 w-full object-cover rounded-lg mb-3"
                    />
                  ) : (
                    <div className="h-36 w-full rounded-lg bg-white/5 flex items-center justify-center text-xs opacity-70 mb-3">
                      (tanpa gambar)
                    </div>
                  )}
                  <h3 className="font-semibold text-amber-300/90">
                    {it.title}
                  </h3>
                  <p className="text-xs opacity-85 mt-1 line-clamp-3">
                    {it.summary}
                  </p>

                  {it.tags?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {it.tags.slice(0, 6).map((t, i) => (
                        <span
                          key={i}
                          className={`text-[11px] px-2 py-0.5 rounded border ${
                            theme === "dark"
                              ? "border-white/15 bg-white/5"
                              : "border-black/10 bg-black/[.04]"
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-auto flex justify-between items-center pt-3">
                    <button
                      onClick={() => {
                        setSelected(it);
                        setOpenModal(true);
                      }}
                      className="text-sm underline opacity-90 hover:opacity-100"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => onDelete(it.id)}
                      className="text-sm px-3 py-1 rounded border border-red-400/50 text-red-300 hover:bg-red-500/10"
                    >
                      Hapus
                    </button>
                  </div>
                </article>
              ))}
          </div>
        )}
      </div>

      {/* MODAL DETAIL */}
      {openModal && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setOpenModal(false)}
        >
          <div
            className={`absolute inset-0 ${
              theme === "dark" ? "bg-black/70" : "bg-black/40"
            } backdrop-blur-sm`}
          />
          <div
            className="relative w-full max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl rounded-2xl p-6 shadow-2xl border z-10 max-h-[90vh] overflow-y-auto no-scrollbar"
            style={{
              background: theme === "dark" ? "#18181b" : "#ffffff",
              color: theme === "dark" ? "white" : "#0a0a0a",
              borderColor:
                theme === "dark"
                  ? "rgba(255,255,255,.2)"
                  : "rgba(0,0,0,.1)",
              WebkitOverflowScrolling: "touch",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-3 gap-4">
              <h3 className="font-bold text-lg">{selected.title}</h3>
              <button
                onClick={() => setOpenModal(false)}
                className="text-sm px-3 py-1 rounded border hover:bg-white/10"
              >
                Tutup
              </button>
            </div>

            <div className="text-xs opacity-75 mb-3">
              Dibuat: {new Date(selected.created_at).toLocaleString()}
            </div>

            {selected.image_url && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
                <img
                  src={selected.image_url}
                  alt={selected.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            )}

            {selected.summary && (
              <section className="mb-4">
                <h4 className="font-semibold mb-1">Ringkasan</h4>
                <p className="text-sm opacity-90 whitespace-pre-wrap">
                  {selected.summary}
                </p>
              </section>
            )}

            {selected.tags?.length ? (
              <section className="mb-4">
                <h4 className="font-semibold mb-1">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {selected.tags.map((t, i) => (
                    <span
                      key={i}
                      className={`text-[11px] px-2 py-0.5 rounded border ${
                        theme === "dark"
                          ? "border-white/15 bg-white/5"
                          : "border-black/10 bg-black/[.04]"
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {selected.facts?.length ? (
              <section className="mb-4">
                <h4 className="font-semibold mb-1">Fakta</h4>
                <ul className="list-disc pl-5 text-sm opacity-90 space-y-1">
                  {selected.facts.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {selected.categories?.length ? (
              <section className="mb-2">
                <h4 className="font-semibold mb-2">Kategori</h4>
                <div className="space-y-3">
                  {selected.categories.map((c, i) => (
                    <div
                      key={i}
                      className={`rounded-lg p-3 ${
                        theme === "dark"
                          ? "bg-white/5 border border-white/10"
                          : "bg-zinc-50 border border-black/10"
                      }`}
                    >
                      <div className="font-medium mb-1">{c.title}</div>
                      <ul className="list-disc pl-5 text-sm opacity-90 space-y-1">
                        {c.items.map((it, j) => (
                          <li key={j}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          {/* Global CSS to hide scrollbar */}
          <style jsx global>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </div>
      )}
    </main>
  );
}

/* ========== VIDEO BACKGROUND ========== */
function VideoBackground({
  srcMp4 = "/VideoDashboard.mp4",
  srcWebm,
  poster,
  theme,
}: {
  srcMp4?: string;
  srcWebm?: string;
  poster?: string;
  theme: Theme;
}) {
  const [soundOn, setSoundOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("ideasVideoSoundOn")
        : null;
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
      localStorage.setItem("ideasVideoSoundOn", String(soundOn));
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
    } catch {}
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
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

      <div
        className={`pointer-events-none absolute inset-0 ${
          theme === "dark" ? "bg-black/45" : "bg-white/30"
        }`}
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.22) 100%)",
          mixBlendMode:
            theme === "dark" ? ("normal" as any) : ("multiply" as any),
        }}
      />

      <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
        <button
          onClick={toggleSound}
          className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium backdrop-blur border transition
            ${
              theme === "dark"
                ? "bg-black/40 border-white/20 text-white hover:bg-black/55"
                : "bg-white/70 border-black/10 text-black hover:bg-white/90"
            }`}
          title={soundOn ? "Matikan suara" : "Hidupkan suara"}
        >
          {soundOn ? "🔊 Unmuted" : "🔈 Unmute"}
        </button>
      </div>

      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          video {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}