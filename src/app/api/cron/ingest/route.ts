import { collectAll, deliverBatch } from "@/lib/collector";
import { logIngest } from "@/lib/db";

export const maxDuration = 300;

// Recolector general: barre todos los medios permitidos/licenciados, captura el orden de portada
// y entrega lotes que cumplen docs/API-INGESTA.md. Protegido con CRON_SECRET.
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const capturedAt = new Date().toISOString();
    const { batches, coverage } = await collectAll(capturedAt);
    const deliveries = [];
    for (const batch of batches) deliveries.push(await deliverBatch(batch));
    const nuevas = deliveries.reduce((total, delivery) => total + Number((delivery.result as { saved?: { items?: number } }).saved?.items ?? 0), 0);
    const summary = { nuevas, feeds: coverage.filter((entry) => entry.state === "collected").length, errores: coverage.filter((entry) => entry.state === "failed").length };
    await logIngest(summary);
    return Response.json({ captured_at: capturedAt, batches: batches.length, deliveries, coverage });
  } catch (error) {
    console.error("collector_failed", error);
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
