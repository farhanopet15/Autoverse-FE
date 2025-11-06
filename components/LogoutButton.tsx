"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LogoutButton({
  className = "",
  variant = "auto",
}: {
  className?: string;
  variant?: "auto" | "light" | "dark";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      router.replace("/");
    } catch (e) {
      console.error(e);
      setLoading(false);
      alert("Gagal logout. Coba lagi ya.");
    }
  }

  const base =
    "px-3 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-60";
  const auto =
    "border hover:bg-white/10 dark:hover:bg-black/10 " +
    "border-black/10 dark:border-white/20";
  const light = "bg-black text-white hover:opacity-90";
  const dark = "bg-white text-black hover:opacity-90";

  const style =
    variant === "auto" ? auto : variant === "light" ? light : dark;

  return (
    <button onClick={onLogout} disabled={loading} className={`${base} ${style} ${className}`}>
      {loading ? "Keluar..." : "Logout"}
    </button>
  );
}