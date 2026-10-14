import { ingestRss } from "@/lib/pipeline/ingest";
import { logIngest, saveArticles, syncCatalog } from "@/lib/db";

// Vercel Cron, 3 veces al día (ver vercel.json). Lee los RSS de los medios en modo automático
// y guarda las piezas nuevas. Protegido con CRON_SECRET.
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  await syncCatalog();
  const { articles, report } = await ingestRss();
  const nuevas = await saveArticles(articles);
  const summary = { nuevas, feeds: report.length, errores: report.filter((r) => !r.ok).length };
  await logIngest(summary);
  return Response.json({ ...summary, leidas: articles.length, report });
}
