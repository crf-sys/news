import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { sql, syncCatalog } from "@/lib/db";
import { ALL_OUTLETS } from "@/lib/sources";

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
    const excerpt = (it.subtitle ?? it.text ?? "").replace(/\s+/g, " ").slice(0, 280) || null;
    await sql`
      insert into articles (outlet_id, url, title, excerpt, kind, via, published_at, body, rights, section, author, provider)
      values (${o.id}, ${it.url}, ${it.title}, ${excerpt}, ${it.kind === "editorial" ? "opinion" : it.kind}, 'api', ${it.published_at},
              ${it.text ?? null}, ${rights}, ${it.section ?? null}, ${it.author ?? null}, ${provider})
      on conflict (outlet_id, url) do update set
        title = excluded.title, excerpt = coalesce(excluded.excerpt, articles.excerpt), body = coalesce(excluded.body, articles.body),
        rights = excluded.rights, section = coalesce(excluded.section, articles.section), author = coalesce(excluded.author, articles.author),
        provider = excluded.provider`;
    saved++;
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
    for (const p of sn.positions) {
      await sql`insert into front_page_snapshot_items (snapshot_id, position, url, title) values (${row.id}, ${p.position}, ${p.url}, ${p.title ?? null})
                on conflict (snapshot_id, position) do update set url = excluded.url, title = excluded.title`;
      // La mejor posición en portada de cada pieza alimenta el ranking.
      await sql`update articles set front_page_rank = least(coalesce(front_page_rank, 999), ${p.position}) where outlet_id = ${o.id} and url = ${p.url}`;
    }
    savedSnapshots++;
  }

  const result = { batch_id, received: { items: items.length, snapshots: snapshots.length }, saved: { items: saved, snapshots: savedSnapshots }, rejected, warnings };
  const rawCopy = { ...parsed.data, items: items.map((i) => (i && typeof i === "object" ? { ...(i as object), text: undefined } : i)) };
  await sql`insert into ingest_batches (batch_id, provider, items, snapshots, result, raw)
            values (${batch_id}, ${provider}, ${items.length}, ${snapshots.length}, ${JSON.stringify(result)}, ${JSON.stringify(rawCopy)})
            on conflict (batch_id) do nothing`;
  return Response.json(result, { status: rejected.length ? 207 : 200 });
}
