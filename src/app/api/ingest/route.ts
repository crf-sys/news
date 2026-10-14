import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { sql, syncCatalog } from "@/lib/db";
import { ALL_OUTLETS } from "@/lib/sources";

export const maxDuration = 300;

// API de ingesta v1.1 (contrato: docs/API-INGESTA.md).
// - Lotes idempotentes por batch_id: reenviar el mismo lote devuelve el mismo resultado sin duplicar.
// - Se guarda copia bruta de cada lote (sin el texto completo) para no perder nada.
// - Rechazos parciales: las piezas válidas se guardan aunque otras del lote fallen.
// - Derechos: los asigna el proveedor. Para medios con reserva de minería, "licenciado" solo se acepta si
//   ese medio está en LICENSED_OUTLETS (lista que Ágora mantiene tras revisar la licencia del proveedor);
//   si no, la pieza se guarda como "sin_licencia" y queda fuera del análisis automático.

const iso = z.string().datetime({ offset: true });
const Item = z.object({
  outlet: z.string().min(2).max(120),
  url: z.string().url().max(1000),
  title: z.string().min(3).max(400),
  subtitle: z.string().max(1000).optional(),
  text: z.string().max(60_000).optional(),
  section: z.string().max(80).optional(),
  author: z.string().max(200).optional(),
  kind: z.enum(["noticia", "opinion", "analisis", "entrevista", "editorial"]).default("noticia"),
  published_at: iso,
  rights: z.enum(["publico", "licenciado", "sin_licencia"]).default("sin_licencia"),
});
const Snapshot = z.object({
  outlet: z.string().min(2).max(120),
  captured_at: iso,
  screenshot_url: z.string().url().max(1000).optional(),
  positions: z.array(z.object({ position: z.number().int().min(1).max(200), url: z.string().url().max(1000), title: z.string().max(400).optional() })).min(1).max(200),
});
const Body = z.object({
  batch_id: z.string().min(8).max(100),
  provider: z.string().min(2).max(60),
  items: z.array(z.unknown()).max(500).default([]),
  snapshots: z.array(z.unknown()).max(60).default([]),
});

const hostOf = (u: string) => new URL(u).hostname.replace(/^www\./, "");
const licensed = () => new Set((process.env.LICENSED_OUTLETS ?? "").split(",").map((s) => s.trim()).filter(Boolean));

function resolveOutlet(outlet: string, url?: string) {
  const byId = ALL_OUTLETS.find((o) => o.id === outlet);
  if (byId || !url) return byId;
  const host = hostOf(url);
  return ALL_OUTLETS.find((o) => !o.region && hostOf(o.url) === host) ?? ALL_OUTLETS.find((o) => hostOf(o.url) === host);
}

function authorized(req: Request) {
  const key = process.env.INGEST_API_KEY ?? "";
  const got = req.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  return key.length > 20 && got.length === key.length && timingSafeEqual(Buffer.from(got), Buffer.from(key));
}

export async function POST(req: Request) {
  if (!authorized(req)) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Formato inválido", issues: parsed.error.issues.slice(0, 20) }, { status: 400 });
  const { batch_id, provider, items, snapshots } = parsed.data;

  // Idempotencia: un lote ya procesado devuelve su resultado original.
  const [done] = await sql`select result from ingest_batches where batch_id = ${batch_id}`;
  if (done) return Response.json({ ...done.result, duplicate_batch: true });

  await syncCatalog();
  const ok = licensed();
  const rejected: { index: number; type: "item" | "snapshot"; url?: string; reason: string }[] = [];
  const warnings: { index: number; url: string; warning: string }[] = [];
  let saved = 0;
  let savedSnapshots = 0;
  const validItems: Array<{ outletId: string; item: z.infer<typeof Item>; rights: z.infer<typeof Item>["rights"] }> = [];

  for (const [index, raw] of items.entries()) {
    const r = Item.safeParse(raw);
    if (!r.success) { rejected.push({ index, type: "item", url: (raw as { url?: string })?.url, reason: r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") }); continue; }
    const it = r.data;
    const o = resolveOutlet(it.outlet, it.url);
    if (!o) { rejected.push({ index, type: "item", url: it.url, reason: `Medio desconocido: ${it.outlet}` }); continue; }
    let rights = it.rights;
    if (o.access === "licencia" && rights !== "sin_licencia" && !ok.has(o.id)) {
      warnings.push({ index, url: it.url, warning: `${o.name} se reserva la minería de textos y no consta licencia validada: guardada como sin_licencia` });
      rights = "sin_licencia";
    }
    validItems.push({ outletId: o.id, item: it, rights });
  }

  // Escritura agrupada: evita cientos de viajes a Neon y mantiene los lotes de 500 bajo el timeout.
  for (let start = 0; start < validItems.length; start += 100) {
    const chunk = validItems.slice(start, start + 100);
    await sql.query(
      `insert into articles (outlet_id, url, title, excerpt, kind, via, published_at, body, rights, section, author, provider)
       select * from unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::timestamptz[], $8::text[], $9::text[], $10::text[], $11::text[], $12::text[])
       on conflict (outlet_id, url) do update set
         title = excluded.title, excerpt = coalesce(excluded.excerpt, articles.excerpt), body = coalesce(excluded.body, articles.body),
         rights = excluded.rights, section = coalesce(excluded.section, articles.section), author = coalesce(excluded.author, articles.author),
         provider = excluded.provider`,
      [
        chunk.map((entry) => entry.outletId),
        chunk.map((entry) => entry.item.url),
        chunk.map((entry) => entry.item.title),
        chunk.map((entry) => (entry.item.subtitle ?? entry.item.text ?? "").replace(/\s+/g, " ").slice(0, 280) || null),
        chunk.map((entry) => entry.item.kind === "editorial" ? "opinion" : entry.item.kind),
        chunk.map(() => "api"),
        chunk.map((entry) => entry.item.published_at),
        chunk.map((entry) => entry.item.text ?? null),
        chunk.map((entry) => entry.rights),
        chunk.map((entry) => entry.item.section ?? null),
        chunk.map((entry) => entry.item.author ?? null),
        chunk.map(() => provider),
      ],
    );
    saved += chunk.length;
  }

  for (const [index, raw] of snapshots.entries()) {
    const r = Snapshot.safeParse(raw);
    if (!r.success) { rejected.push({ index, type: "snapshot", reason: r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") }); continue; }
    const sn = r.data;
    const o = resolveOutlet(sn.outlet, sn.positions[0]?.url);
    if (!o) { rejected.push({ index, type: "snapshot", reason: `Medio desconocido: ${sn.outlet}` }); continue; }
    const [row] = await sql`
      insert into front_page_snapshots (outlet_id, provider, batch_id, captured_at, screenshot_url)
      values (${o.id}, ${provider}, ${batch_id}, ${sn.captured_at}, ${sn.screenshot_url ?? null})
      on conflict (outlet_id, provider, captured_at) do update set screenshot_url = coalesce(excluded.screenshot_url, front_page_snapshots.screenshot_url)
      returning id`;
    await sql.query(
      `insert into front_page_snapshot_items (snapshot_id, position, url, title)
       select $1::uuid, * from unnest($2::smallint[], $3::text[], $4::text[])
       on conflict (snapshot_id, position) do update set url = excluded.url, title = excluded.title`,
      [row.id, sn.positions.map((p) => p.position), sn.positions.map((p) => p.url), sn.positions.map((p) => p.title ?? null)],
    );
    await sql.query(
      `update articles a set front_page_rank = least(coalesce(a.front_page_rank, 999), p.position)
       from unnest($1::text[], $2::smallint[]) as p(url, position)
       where a.outlet_id = $3 and a.url = p.url`,
      [sn.positions.map((p) => p.url), sn.positions.map((p) => p.position), o.id],
    );
    savedSnapshots++;
  }

  const result = { batch_id, received: { items: items.length, snapshots: snapshots.length }, saved: { items: saved, snapshots: savedSnapshots }, rejected, warnings };
  const rawCopy = { ...parsed.data, items: items.map((i) => (i && typeof i === "object" ? { ...(i as object), text: undefined } : i)) };
  await sql`insert into ingest_batches (batch_id, provider, items, snapshots, result, raw)
            values (${batch_id}, ${provider}, ${items.length}, ${snapshots.length}, ${JSON.stringify(result)}, ${JSON.stringify(rawCopy)})
            on conflict (batch_id) do nothing`;
  return Response.json(result, { status: rejected.length ? 207 : 200 });
}
