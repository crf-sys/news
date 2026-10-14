import { buildEdition } from "@/lib/pipeline";
import { REGIONS } from "@/lib/regions";

export const maxDuration = 300;

// Vercel Cron → genera y publica la edición de un ámbito: /api/cron/edition?region=es
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const region = new URL(req.url).searchParams.get("region") ?? "es";
  if (!REGIONS.some((r) => r.id === region)) return new Response("Región desconocida", { status: 400 });
  return Response.json(await buildEdition(region));
}
