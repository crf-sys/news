import { cosineSimilarity, embedMany } from "ai";
import { MODELS } from "../ai/models";
import { sql } from "../db";
import { licensedOutletIds } from "../licenses";

// ETAPA 2 — Agrupar en "temas" las piezas de distintos medios sobre el mismo hecho.
// Embeddings de titular + extracto y agrupación voraz contra el centroide del cluster.
// Las piezas de opinión no abren temas: se enganchan a uno existente con un umbral más laxo.

export interface PoolArticle {
  id: string;
  outlet_id: string;
  url: string;
  title: string;
  excerpt: string | null;
  kind: string;
  published_at: string;
}

export interface Cluster {
  id: string;
  articles: PoolArticle[];
  outlets: string[];
  centroid: number[];
}

const NEWS_THRESHOLD = 0.7;
const OPINION_THRESHOLD = 0.6;

export async function loadPool(region: string, hours = 36): Promise<PoolArticle[]> {
  return (await sql`
    select a.id, a.outlet_id, a.url, a.title, a.excerpt, a.kind, a.published_at
    from articles a join outlets o on o.id = a.outlet_id
    where o.region = ${region} and a.published_at > now() - make_interval(hours => ${hours})
      -- Medios con reserva de minería: solo entran si la pieza llega licenciada.
      and (o.access <> 'licencia' or a.rights = 'licenciado' or a.outlet_id = any(${[...licensedOutletIds()]}))
    order by a.published_at desc`) as PoolArticle[];
}

export async function clusterArticles(pool: PoolArticle[]): Promise<Cluster[]> {
  if (!pool.length) return [];
  const { embeddings } = await embedMany({
    model: MODELS.embedding,
    values: pool.map((a) => `${a.title}. ${a.excerpt ?? ""}`.slice(0, 600)),
  });

  const clusters: (Cluster & { vectors: number[][] })[] = [];
  const order = pool.map((a, i) => ({ a, v: embeddings[i] })).sort((x, y) => Number(x.a.kind === "opinion") - Number(y.a.kind === "opinion"));

  for (const { a, v } of order) {
    let best: (typeof clusters)[number] | undefined;
    let bestSim = 0;
    for (const c of clusters) {
      const sim = cosineSimilarity(v, c.centroid);
      if (sim > bestSim) [best, bestSim] = [c, sim];
    }
    const threshold = a.kind === "opinion" ? OPINION_THRESHOLD : NEWS_THRESHOLD;
    if (best && bestSim >= threshold) {
      best.articles.push(a);
      best.vectors.push(v);
      best.centroid = best.centroid.map((_, i) => best!.vectors.reduce((s, x) => s + x[i], 0) / best!.vectors.length);
      if (!best.outlets.includes(a.outlet_id)) best.outlets.push(a.outlet_id);
    } else if (a.kind !== "opinion") {
      clusters.push({ id: a.id, articles: [a], outlets: [a.outlet_id], centroid: v, vectors: [v] });
    }
  }
  return clusters.map(({ vectors: _, ...c }) => c);
}
