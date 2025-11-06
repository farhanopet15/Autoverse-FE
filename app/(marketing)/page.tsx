"use client";
import Link from "next/link";
import React from "react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* === VIDEO BG START === */}
      {/* video full-bleed di belakang semua konten */}
      <video
        className="pointer-events-none absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        // poster="/bg-poster.jpg"
        preload="none"
      >
        <source src="/Speedometer.mp4" type="video/mp4" />
        {/* fallback kalau browser tak dukung video */}
        Maaf, browser Anda tidak mendukung video background.
      </video>
      {/* overlay efek agar teks tetap kebaca */}
      <div aria-hidden className="absolute inset-0 bg-black/40" />
      {/* === VIDEO BG END === */}

      {/* (opsional) tetap pakai glow/grid di atas video */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.12),transparent_30%)]" />
      <div aria-hidden className="absolute inset-0 [background-image:linear-gradient(transparent,transparent_31px,rgba(255,255,255,.04)_31px),linear-gradient(90deg,transparent,transparent_31px,rgba(255,255,255,.04)_31px)] bg-[length:32px_32px]" />

      <header className="max-w-7xl mx-auto px-6 pt-6 flex justify-end gap-3" />

      <section className="max-w-7xl mx-auto px-6 py-14 md:py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative z-10">
          <span className="inline-flex items-center text-[11px] tracking-wide uppercase rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-white/80">
            NxOne
          </span>

          <h1 className="mt-4 text-5xl md:text-6xl leading-tight font-extrabold">
            AUTO VERSE
          </h1>

          <p className="mt-5 text-base md:text-lg text-white/80 max-w-xl">
            Kelola koleksi kendaraanmu, service history, dan parts — semua dalam satu
            dashboard. Membantu kamu tetap terorganisir dan mengingat semua detail kendaraanmu.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <Link href="/login" className="px-6 py-3 rounded-lg bg-white text-black font-semibold inline-block">
              Masuk
            </Link>
            <Link href="/register" className="px-6 py-3 rounded-lg border border-white/20 text-white/90 inline-block hover:bg-white/5">
              Daftar
            </Link>
          </div>
        </div>

        {/* Mesin sport dengan parallax interaktif */}
        <div className="relative z-0 h-[360px] md:h-[460px]">
          <EngineParallax />
        </div>
      </section>

      {/* styles */}
      <style jsx global>{`
        .engine-scene { perspective: 1200px; }
        .engine-card {
          width: 360px; height: 360px;
          position: relative;
          transform-style: preserve-3d;
          margin: auto;
          animation: floaty 6.5s ease-in-out infinite;
          transition: transform 120ms ease-out, box-shadow 120ms ease-out;
          box-shadow: 0 35px 80px rgba(0,0,0,.55);
          border-radius: 22px;
        }
        @media (min-width: 768px){ .engine-card { width: 460px; height: 460px; } }
        .engine-bgGlow {
          position:absolute; inset:-6%;
          border-radius: 30px;
          background:
            radial-gradient(60% 60% at 70% 20%, rgba(147,51,234,.32), transparent 60%),
            radial-gradient(60% 60% at 20% 80%, rgba(16,185,129,.32), transparent 60%),
            radial-gradient(80% 80% at 50% 50%, rgba(255,255,255,.06), transparent 70%);
          filter: blur(18px);
          pointer-events:none;
          transform: translateZ(-40px);
        }
        .engine-frame {
          position:absolute; inset:0;
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,.12);
          background: linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02));
          transform: translateZ(1px);
        }
        .engine-img {
          position:absolute; inset:10px;
          border-radius: 18px;
          width: calc(100% - 20px); height: calc(100% - 20px);
          object-fit: cover;
          transform: translateZ(50px);
          backface-visibility: hidden;
          clip-path: inset(0 round 18px);
          box-shadow: 0 0 60px rgba(59,130,246,.15), 0 0 80px rgba(16,185,129,.12);
        }
        .grid-overlay {
          position:absolute; inset:0; border-radius:22px; pointer-events:none;
          background-image:
            linear-gradient(transparent,transparent 31px, rgba(255,255,255,.06) 31px),
            linear-gradient(90deg,transparent,transparent 31px, rgba(255,255,255,.06) 31px);
          background-size:32px 32px;
          mix-blend-mode:overlay;
          transform: translateZ(60px);
        }
        @keyframes floaty {
          0%,100% { transform: translateY(0px) rotateZ(0.0deg); }
          50% { transform: translateY(-12px) rotateZ(1deg); }
        }
        /* Hargai preferensi user untuk meminimalkan animasi */
        @media (prefers-reduced-motion: reduce) {
          video { animation: none !important; }
          .engine-card { animation: none !important; }
        }
      `}</style>
    </main>
  );
}

/* ================= EngineParallax ================= */
function EngineParallax() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const [src, setSrc] = React.useState<string>(() =>
    "/foto1.jpg"
  );

  const handleError = React.useCallback(() => {
    setSrc("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Toyota_2JZ-GTE_engine_001.jpg/1600px-Toyota_2JZ-GTE_engine_001.jpg");
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const maxTilt = 12;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * -2 * maxTilt;
      const ry = (px - 0.5) *  2 * maxTilt;
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      el.style.animationPlayState = "paused";
    };
    const onLeave = () => {
      el.style.transform = `rotateX(0deg) rotateY(0deg)`;
      el.style.animationPlayState = "running";
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="engine-scene absolute inset-0 flex items-center justify-center">
      <div ref={ref} className="engine-card will-change-transform">
        <div className="engine-bgGlow" />
        <div className="engine-frame" />
        <img
          ref={imgRef}
          src={src}
          alt="Sport car engine"
          className="engine-img"
          loading="eager"
          referrerPolicy="no-referrer"
          onError={handleError}
        />
        <div className="grid-overlay" />
      </div>
    </div>
  );
}