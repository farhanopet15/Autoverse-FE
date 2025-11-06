"use client";
import { supabase } from "./supabaseClient";

export async function uploadInspiration(file: File): Promise<{ path: string; publicUrl: string }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const cleanName = file.name.replace(/\s+/g, "_");
  const path = `${userId}/${Date.now()}_${cleanName}`;

  const { error: upErr } = await supabase
    .storage
    .from("inspirations")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream"
    });

  if (upErr) throw upErr;

  const { data } = supabase.storage.from("inspirations").getPublicUrl(path);
  const publicUrl = data.publicUrl;
  return { path, publicUrl };
}