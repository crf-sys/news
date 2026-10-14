import type { DailyEdition } from "../types";
import { ingestRss, scrapeFrontPages } from "./ingest";
import { clusterArticles } from "./cluster";
import { rankClusters } from "./rank";
import { analyzeCluster } from "./analyze";

// Orquestación diaria (cron 06:00 Madrid). La newsletter sale a las 07:00 con la edición resultante.
export async function buildDailyEdition(date: string): Promise<DailyEdition> {
  const [{ articles }] = await Promise.all([ingestRss(), scrapeFrontPages()]);
  const clusters = await clusterArticles(articles);
  const top = rankClusters(clusters);
  const stories = await Promise.all(top.map((c, i) => analyzeCluster(c, i + 1)));
  return { date, generatedAt: new Date().toISOString(), stories };
}
