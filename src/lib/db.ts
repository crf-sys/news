import { neon } from "@neondatabase/serverless";
import type { Article } from "./types";
import { ALL_OUTLETS, COLUMNISTS } from "./sources";

// Cliente HTTP de Neon. La web usa el usuario `agora_app` (APP_DATABASE_URL), con permisos mínimos:
// leer, insertar y actualizar; nunca borrar ni cambiar el esquema (ver scripts/app-role.mjs).
// DATABASE_URL (propietario) queda solo para migraciones y scripts locales.
export const sql = neon((process.env.APP_DATABASE_URL ?? process.env.DATABASE_URL)!);

/** Copia medios y voces definidos en código a la BD (upsert). Barato: se llama antes de cada ingesta. */
export async function syncCatalog() {
  // Primero medios y después voces: las voces referencian a su medio.
  await Promise.all(
    ALL_OUTLETS.map((o) => sql`
      insert into outlets (id, name, url, lean, lean_source, region, access)
      values (${o.id}, ${o.name}, ${o.url}, ${o.lean ?? null}, ${o.leanSource}, ${o.region ?? "es"}, ${o.access})
      on conflict (id) do update set name = excluded.name, url = excluded.url, lean = excluded.lean,
        lean_source = excluded.lean_source, region = excluded.region, access = excluded.access`),
  );
  await Promise.all(
    COLUMNISTS.map((c) => sql`
      insert into voices (id, name, kind, outlet_id, inclusion_reason, status)
      values (${c.id}, ${c.name}, ${c.kind}, ${c.outletId === "independiente" ? null : c.outletId}, ${c.inclusionReason ?? "Panel inicial"}, 'activo')
      on conflict (id) do nothing`),
  );
}

/** Guarda piezas nuevas; las ya vistas (misma URL) se ignoran. Devuelve cuántas eran nuevas. */
export async function saveArticles(articles: Article[]): Promise<number> {
  if (!articles.length) return 0;
  const rows = await sql.query(
    `insert into articles (outlet_id, url, title, excerpt, kind, via, published_at)
     select * from unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::timestamptz[])
     on conflict (outlet_id, url) do nothing
     returning id`,
    [
      articles.map((a) => a.outletId),
      articles.map((a) => a.url),
      articles.map((a) => a.title),
      articles.map((a) => a.excerpt),
      articles.map((a) => a.kind),
      articles.map((a) => a.via),
      articles.map((a) => a.publishedAt),
    ],
  );
  return rows.length;
}

export interface StoredArticle {
  id: string;
  outlet_id: string;
  url: string;
  title: string;
  kind: string;
  published_at: string;
}

export async function latestArticles(limit = 60) {
  return (await sql`select id, outlet_id, url, title, kind, published_at from articles order by published_at desc limit ${limit}`) as StoredArticle[];
}

export async function ingestStats() {
  const [row] = await sql`
    select count(*)::int as total,
           count(*) filter (where kind = 'opinion')::int as opinion,
           count(*) filter (where published_at > now() - interval '24 hours')::int as last24h,
           max(published_at) as newest
    from articles`;
  const last = await sql`select change, at from audit_log where entity = 'ingesta' order by at desc limit 1`;
  return { ...(row as { total: number; opinion: number; last24h: number; newest: string | null }), lastRun: last[0] as { change: { nuevas: number; feeds: number; errores: number }; at: string } | undefined };
}

export async function logIngest(change: { nuevas: number; feeds: number; errores: number }) {
  await sql`insert into audit_log (actor, entity, entity_id, change, reason) values ('cron', 'ingesta', ${new Date().toISOString()}, ${JSON.stringify(change)}, 'Ingesta programada')`;
}
