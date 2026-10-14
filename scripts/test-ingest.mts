// Prueba manual del motor de ingesta: npx tsx scripts/test-ingest.mts
import { ingestRss } from "../src/lib/pipeline/ingest";

const { articles, report } = await ingestRss();
console.table(report.map((r) => ({ medio: r.outletId, feed: r.feed.replace(/^https:\/\/(www\.)?/, ""), ok: r.ok, items: r.items, error: r.error ?? "" })));
console.log("Piezas únicas:", articles.length, "· opinión:", articles.filter((a) => a.kind === "opinion").length);
for (const a of articles.slice(0, 8)) console.log(`- [${a.outletId}] ${a.publishedAt.slice(11, 16)} ${a.kind === "opinion" ? "(OPINIÓN) " : ""}${a.title}`);
