"use server";

import { redirect } from "next/navigation";

// Alta de una voz. Al guardarla, el sistema:
//  1. la inserta en `voices` + `voice_channels` (RSS, newsletter, web, redes),
//  2. lanza un backfill de sus últimos 12 meses de textos,
//  3. calcula su ficha ideológica (pipeline/profile.ts) y la marca "en calibración"
//     hasta tener ≥ 30 textos analizados,
//  4. desde ese momento sus piezas se enlazan automáticamente a los temas del día.
// TODO: auth (solo editores), validación con zod, persistencia en Postgres.
export async function createVoice(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!name || !reason) redirect("/admin?error=1");
  redirect("/admin?ok=1");
}
