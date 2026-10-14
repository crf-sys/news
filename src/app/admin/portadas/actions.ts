"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { OUTLETS } from "@/lib/sources";

const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });

/** Guarda la revisión de la portada de un medio: qué temas lleva y en qué posición (vacío = no lo lleva). */
export async function saveFrontPage(formData: FormData) {
  const editor = await requireAdmin();
  const outletId = String(formData.get("outletId"));
  if (!OUTLETS.some((o) => o.id === outletId && o.access === "licencia")) return;
  const day = today();

  await sql`insert into front_page_reviews (day, outlet_id, editor) values (${day}, ${outletId}, ${editor})
            on conflict (day, outlet_id) do update set editor = excluded.editor, reviewed_at = now()`;
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("pos:")) continue;
    const topicId = key.slice(4);
    const n = Number(value);
    const position = Number.isInteger(n) && n >= 1 && n <= 30 ? n : null;
    await sql`insert into front_page_marks (day, outlet_id, topic_id, position, editor) values (${day}, ${outletId}, ${topicId}, ${position}, ${editor})
              on conflict (day, outlet_id, topic_id) do update set position = excluded.position, editor = excluded.editor, updated_at = now()`;
  }
  const extra = String(formData.get("extraHeadline") ?? "").trim();
  if (extra) {
    const pos = Number(formData.get("extraPosition"));
    await sql`insert into front_page_extra (day, outlet_id, headline, url, position, editor)
              values (${day}, ${outletId}, ${extra.slice(0, 200)}, ${String(formData.get("extraUrl") ?? "").trim() || null}, ${Number.isInteger(pos) && pos > 0 ? pos : null}, ${editor})`;
  }
  revalidatePath("/admin/portadas");
  revalidatePath("/");
}
