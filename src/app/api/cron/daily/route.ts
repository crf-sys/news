import { buildDailyEdition } from "@/lib/pipeline";

// Vercel Cron → genera la edición del día y la guarda (TODO: persistir en Postgres).
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const date = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
  const edition = await buildDailyEdition(date);
  return Response.json({ date, stories: edition.stories.length });
}
