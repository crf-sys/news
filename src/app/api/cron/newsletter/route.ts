import { sql } from "@/lib/db";
import { latestEdition } from "@/lib/editions";
import { dailyEmail, FROM } from "@/lib/newsletter";
import { resend } from "@/lib/mail";
import { ACTIVE_REGIONS } from "@/lib/regions";

export const maxDuration = 300;

// Envío diario a las 07:00 de Madrid. Vercel Cron va en UTC: se programa a las 05:00 y 06:00 UTC
// y solo envía cuando en Madrid son las 7 (cubre horario de verano e invierno).
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const force = new URL(req.url).searchParams.get("force") === "1";
  const hour = Number(new Date().toLocaleString("en-GB", { timeZone: "Europe/Madrid", hour: "2-digit", hour12: false }));
  if (hour !== 7 && !force) return Response.json({ skipped: true, hour });

  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
  const report = [];
  for (const r of ACTIVE_REGIONS) {
    const ed = await latestEdition(r.id);
    if (!ed || ed.date !== today) { report.push({ region: r.id, skipped: "sin edición de hoy" }); continue; }
    const subs = await sql`
      select email, unsubscribe_token from subscribers
      where region = ${r.id} and confirmed_at is not null and unsubscribed_at is null
        and (last_sent_on is null or last_sent_on < ${today})`;
    let sent = 0, failed = 0;
    for (let i = 0; i < subs.length; i += 100) {
      const chunk = subs.slice(i, i + 100);
      const { error } = await resend.batch.send(chunk.map((s) => ({ from: FROM, to: s.email as string, ...dailyEmail(ed, s.unsubscribe_token as string) })));
      if (error) { failed += chunk.length; console.error("Error en lote de newsletter", error.message); continue; }
      sent += chunk.length;
      await sql`update subscribers set last_sent_on = ${today} where email = any(${chunk.map((s) => s.email as string)})`;
    }
    await sql`insert into newsletter_sends (day, region, sent, failed) values (${today}, ${r.id}, ${sent}, ${failed})
              on conflict (day, region) do update set sent = newsletter_sends.sent + excluded.sent, failed = excluded.failed, at = now()`;
    report.push({ region: r.id, sent, failed });
  }
  return Response.json({ today, report });
}
