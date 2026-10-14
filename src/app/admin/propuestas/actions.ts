"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

// Aceptar crea la voz en estado "calibrando" (su ficha se medirá con sus textos); descartar exige motivo.
export async function reviewProposal(formData: FormData) {
  const editor = await requireAdmin();
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision"));
  const note = String(formData.get("note") ?? "").trim() || null;
  if (decision !== "aceptada" && decision !== "descartada") return;

  const [p] = await sql`update voice_proposals set status = ${decision}, review_note = ${note} where id = ${id} returning *`;
  if (p && decision === "aceptada") {
    const voiceId = `voz-${String(p.name).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    await sql`insert into voices (id, name, kind, inclusion_reason) values (${voiceId}, ${p.name}, ${p.kind}, ${p.reason}) on conflict (id) do nothing`;
    if (p.url) await sql`insert into voice_channels (voice_id, kind, value) values (${voiceId}, 'web', ${p.url})`;
  }
  await sql`insert into audit_log (actor, entity, entity_id, change, reason) values (${editor}, 'voice_proposal', ${id}, ${JSON.stringify({ decision })}, ${note})`;
  revalidatePath("/admin/propuestas");
}
