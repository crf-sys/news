"use server";

import { redirect } from "next/navigation";

// Guarda una nota de lectura humana y la pasa a la etapa de análisis.
// TODO: auth de editor, persistir en `editor_notes`, lanzar analyzeCluster() del tema.
export async function saveNote(formData: FormData) {
  const required = ["storyId", "outletId", "url", "claims"];
  if (required.some((k) => !String(formData.get(k) ?? "").trim()) || formData.get("own") !== "on") {
    redirect("/admin/editor?error=1");
  }
  redirect("/admin/editor?ok=1");
}
