"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { uploadInspiration } from "@/lib/uploadToStorage";

type Category = { title: string; items: string[] };

export default function PlanTripModal({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [facts, setFacts] = useState<string[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [insight, setInsight] = useState<string | undefined>();

  const overlayRef = useRef<HTMLDivElement>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function onOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTitle(""); setSummary(""); setTags([]); setFacts([]); setCats([]); setInsight(undefined);

    try {
      const token = await getToken();
      if (!token) throw new Error("Harus login terlebih dahulu");

      let imageUrl: string | undefined;
      if (file) {
        const up = await uploadInspiration(file);
        imageUrl = up.publicUrl;
      }

      const resp = await fetch(`${apiBase}/api/ai/describe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ desc, imageUrl })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.error ? JSON.stringify(err.error) : `HTTP ${resp.status}`);
      }
      const json = await resp.json();

      setTitle(json.data.title || "Otomotif");
      setSummary(json.data.summary || "");
      setTags(json.data.tags || []);
      setFacts(json.data.facts || []);
      setCats(json.data.categories || []);
      setInsight(json.data.imageInsights);
    } catch (e: any) {
      alert(e?.message || "Gagal memproses permintaan");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog" aria-modal="true"
    >
      <div className="w-full max-w-3xl rounded-2xl bg-[#0f172a] text-white shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-xl font-semibold">AI Otomotif</h3>
          <button onClick={onClose} className="rounded-full px-3 py-1 text-sm bg-white/10 hover:bg-white/20">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Ketik apa saja terkait otomotif: 'BMW', 'Evo 9 Lancer', 'SUV keluarga harian', 'upgrade rem', dll."
            className="min-h-[96px] w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
          />

          <label htmlFor="img" className="block rounded-xl border border-dashed border-white/15 bg-white/5 hover:bg-white/10 transition p-6 text-center cursor-pointer">
            <input id="img" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
            <div className="opacity-90">
              <div className="text-2xl">📷</div>
              <div className="font-medium mt-1">Unggah foto (opsional)</div>
              <div className="text-sm opacity-70">PNG/JPG</div>
              {file && <div className="text-xs mt-2 opacity-80">Terpilih: <span className="font-mono">{file.name}</span></div>}
            </div>
          </label>

          <button disabled={loading} className="w-full rounded-xl px-6 py-3 font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-60">
            {loading ? "Memproses..." : "Jalankan AI Otomotif"}
          </button>
        </form>

        {/* Hasil */}
        <div className="px-6 pb-6 space-y-4">
          {title && <h4 className="text-lg font-semibold">{title}</h4>}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((t: string) => (
                <span key={t} className="text-xs rounded-full px-3 py-1 bg-white/10 border border-white/15">{t}</span>
              ))}
            </div>
          )}

          {summary && <p className="text-sm opacity-90">{summary}</p>}

          {insight && (
            <p className="text-sm opacity-80">
              <b>Insight Gambar:</b> {insight}
            </p>
          )}

          {facts.length > 0 && (
            <ul className="list-disc pl-5 space-y-1 text-sm opacity-90">
              {facts.map((f: string) => <li key={f}>{f}</li>)}
            </ul>
          )}

          {cats.length > 0 && (
            <div className="grid md:grid-cols-3 gap-4">
              {cats.map((c) => (
                <article key={c.title} className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <h5 className="font-semibold">{c.title}</h5>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm opacity-90">
                    {c.items.map((it) => <li key={it}>{it}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          )}

          {!loading && !summary && (
            <p className="text-sm opacity-70">Isi deskripsi/foto lalu jalankan AI.</p>
          )}
        </div>
      </div>
    </div>
  );
}