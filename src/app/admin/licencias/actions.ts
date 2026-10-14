"use server";

import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { ALL_OUTLETS } from "@/lib/sources";

// Activación manual de un medio con reserva: exige documentar la licencia y la declaración del editor
// que la activa. Todo queda en audit_log. Revocar la desactiva al momento.
export async function activateLicense(formData: FormData) {
  const editor = await requireAdmin();
  const f = (k: string) => String(formData.get(k) ?? "").trim();
  const outlet = ALL_OUTLETS.find((o) => o.id === f("outletId") && o.access === "licencia");
  if (!outlet || !f("licensor") || f("reference").length < 4 || !["titulares", "texto_completo"].includes(f("scope")) || !f("validFrom")) {
    redirect("/admin/licencias?error=campos");
  }
  if (formData.get("declaration") !== "on") redirect("/admin/licencias?error=declaracion");
  const [row] = await sql`
    insert into outlet_licenses (outlet_id, licensor, reference, scope, valid_from, valid_until, document_url, activated_by)
    values (${outlet.id}, ${f("licensor")}, ${f("reference")}, ${f("scope")}, ${f("validFrom")}, ${f("validUntil") || null}, ${f("documentUrl") || null}, ${editor})
    returning id`;
  await sql`insert into audit_log (actor, entity, entity_id, change, reason)
            values (${editor}, 'licencia', ${row.id}, ${JSON.stringify({ outlet: outlet.id, accion: "activar", scope: f("scope") })}, ${`${f("licensor")} · ${f("reference")}`})`;
  redirect("/admin/licencias?ok=1");
}

export async function revokeLicense(formData: FormData) {
  const editor = await requireAdmin();
  const id = String(formData.get("id"));
  await sql`update outlet_licenses set revoked_at = now(), revoked_by = ${editor} where id = ${id} and revoked_at is null`;
  await sql`insert into audit_log (actor, entity, entity_id, change, reason) values (${editor}, 'licencia', ${id}, ${JSON.stringify({ accion: "revocar" })}, 'Revocada manualmente')`;
  redirect("/admin/licencias?revocada=1");
}
