import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { sql, syncCatalog } from "@/lib/db";
import { ALL_OUTLETS } from "@/lib/sources";

// Entrada de noticias desde un sistema externo (especificación: docs/API-INGESTA.md).
// Acepta lotes de hasta 500 piezas; los duplicados (mismo medio + URL) actualizan la pieza existente.
// Las piezas de medios que se reservan la minería de textos solo se analizan si llegan con
// rights = "licenciado"; si no, se guardan pero quedan fuera del análisis.

const Item = z.object({
  outlet: z.string().min(2).max(120),
  url: z.string().url().max(1000),
  title: z.string().min(3).max(400),
  subtitle: z.string().max(1000).optional(),
  text: z.string().max(60_000).optional(),
  section: z.string().max(80).optional(),
  author: z.string().max(200).optional(),
  kind: z.enum(["noticia", "opinion", "analisis", "entrevista", "editorial"]).default("noticia"),
  published_at: z.string().datetime({ offset: true }),
  front_page: z.object({ position: z.number().int().min(1).max(200), captured_at: z.string().datetime({ offset: true }).optional() }).optional(),
  rights: z.enum(["publico", "licenciado", "sin_licencia"]).default("sin_licencia"),
});
const Body = z.object({ items: z.array(Item).min(1).max(500) });

const hostOf = (u: string) => new URL(u).hostname.replace(/^www\./, "");

function resolveOutlet(outlet: string, url: string) {
  const byId = ALL_OUTLETS.find((o) => o.id === outlet);
  if (byId) return byId;
  const host = hostOf(url);
  // Medio nacional del dominio (no las secciones regionales, que comparten dominio).
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

  await syncCatalog();
  const rejected: { url: string; reason: string }[] = [];
  let saved = 0;
  for (const it of parsed.data.items) {
    const o = resolveOutlet(it.outlet, it.url);
    if (!o) { rejected.push({ url: it.url, reason: `Medio desconocido: ${it.outlet}` }); continue; }
    const excerpt = (it.subtitle ?? it.text ?? "").replace(/\s+/g, " ").slice(0, 280) || null;
    const kind = it.kind === "editorial" ? "opinion" : it.kind;
    await sql`
      insert into articles (outlet_id, url, title, excerpt, kind, via, published_at, front_page_rank, body, rights, section, author)
      values (${o.id}, ${it.url}, ${it.title}, ${excerpt}, ${kind}, 'api', ${it.published_at}, ${it.front_page?.position ?? null},
              ${it.text ?? null}, ${it.rights}, ${it.section ?? null}, ${it.author ?? null})
      on conflict (outlet_id, url) do update set
        title = excluded.title,
        excerpt = coalesce(excluded.excerpt, articles.excerpt),
        body = coalesce(excluded.body, articles.body),
        rights = excluded.rights,
        section = coalesce(excluded.section, articles.section),
        author = coalesce(excluded.author, articles.author),
        front_page_rank = least(coalesce(articles.front_page_rank, 999), coalesce(excluded.front_page_rank, 999))`;
    saved++;
  }
  await sql`insert into audit_log (actor, entity, entity_id, change, reason)
            values ('api', 'ingesta', ${new Date().toISOString()}, ${JSON.stringify({ recibidas: parsed.data.items.length, guardadas: saved, rechazadas: rejected.length })}, 'Ingesta por API')`;
  return Response.json({ received: parsed.data.items.length, saved, rejected });
}
