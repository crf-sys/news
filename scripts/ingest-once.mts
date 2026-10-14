// Ingesta manual (la misma que hace el cron): npx tsx --env-file=.env.local scripts/ingest-once.mts
import { ingestRss } from "../src/lib/pipeline/ingest";
import { ingestStats, logIngest, saveArticles, syncCatalog } from "../src/lib/db";

await syncCatalog();
const { articles, report } = await ingestRss();
const nuevas = await saveArticles(articles);
await logIngest({ nuevas, feeds: report.length, errores: report.filter((r) => !r.ok).length });
console.log({ leidas: articles.length, nuevas, ...(await ingestStats()) });
