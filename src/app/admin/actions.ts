"use server";

import { redirect } from "next/navigation";
import { sql } from "@/lib/db";

// Alta de una voz. Queda en estado "calibrando" hasta que el backfill (F3) analice ≥ 30 textos.
// TODO: auth (solo editores) y lanzar el backfill de 12 meses.
export async function createVoice(formData: FormData) {
  const f = (k: string) => String(formData.get(k) ?? "").trim();
  if (!f("name") || !f("reason")) redirect("/admin?error=1");

  const id = `voz-${f("name").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  await sql`
    insert into voices (id, name, kind, outlet_id, inclusion_reason)
    values (${id}, ${f("name")}, ${f("kind")}, ${f("outletId") === "independiente" ? null : f("outletId")}, ${f("reason")})
    on conflict (id) do nothing`;
  const channels = [["rss", f("feedUrl")], ["newsletter", f("newsletter")], ["social", f("social")]].filter(([, v]) => v);
  for (const [kind, value] of channels) {
    await sql`insert into voice_channels (voice_id, kind, value) values (${id}, ${kind}, ${value})`;
  }
  await sql`insert into audit_log (actor, entity, entity_id, change, reason) values ('editor', 'voice', ${id}, ${JSON.stringify({ alta: true })}, ${f("reason")})`;
  redirect("/admin?ok=1");
}
