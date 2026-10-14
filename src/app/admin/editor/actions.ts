"use server";

import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

// Guarda una nota de lectura humana. TODO: auth de editor y lanzar el análisis del tema.
export async function saveNote(formData: FormData) {
  const editor = await requireAdmin();
  const f = (k: string) => String(formData.get(k) ?? "").trim();
  if (["storyId", "outletId", "url", "claims"].some((k) => !f(k)) || formData.get("own") !== "on") {
    redirect("/admin/editor?error=1");
  }
  await sql`
    insert into editor_notes (topic_id, outlet_id, voice_id, url, kind, claims, framing, opinions, editor)
    values (${f("storyId")}, ${f("outletId")}, ${f("columnistId") || null}, ${f("url")}, ${f("kind")},
            ${f("claims")}, ${f("framing") || null}, ${f("opinions") || null}, ${editor})`;
  redirect("/admin/editor?ok=1");
}
