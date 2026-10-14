import { MODELS } from "../ai/models";
import { sql } from "../db";
import { readableOutlets } from "./ingest";
import { clusterArticles, loadPool } from "./cluster";
import { rankClusters } from "./rank";
import { analyzeCluster } from "./analyze";
import type { Story } from "../types";

// Orquestación de una edición (nacional o autonómica). Totalmente automática:
// piezas de las últimas 36 h → temas → las 10 → informe verificado de cada una → publicación.
export async function buildEdition(region: string) {
  const started = Date.now();
  const model = region === "es" ? MODELS.analysisNational : MODELS.analysisRegional;
  const pool = await loadPool(region);
  const clusters = await clusterArticles(pool);
  const outletsAvailable = readableOutlets().filter((o) => (o.region ?? "es") === region).length;
  const top = await rankClusters(clusters);

  // En paralelo; si un tema falla, la edición sale igualmente con el resto.
  const results = await Promise.allSettled(top.map((c, i) => analyzeCluster(c, i + 1, model)));
  const stories = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
  for (const s of stories) if (s.objectivity) s.objectivity.outletsTotal = outletsAvailable;
  stories.forEach((s, i) => (s.rank = i + 1));
  const errors = results.flatMap((r) => (r.status === "rejected" ? [String(r.reason).slice(0, 300)] : []));

  const day = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
  const stats = { pool: pool.length, clusters: clusters.length, stories: stories.length, errors, seconds: Math.round((Date.now() - started) / 1000) };
  if (stories.length) {
    await sql`
      insert into editions (region, day, generated_at, model, stats, stories)
      values (${region}, ${day}, now(), ${model}, ${JSON.stringify(stats)}, ${JSON.stringify(stories satisfies Story[])})
      on conflict (region, day) do update set generated_at = now(), model = excluded.model, stats = excluded.stats, stories = excluded.stories`;
  }
  return { region, day, ...stats };
}
