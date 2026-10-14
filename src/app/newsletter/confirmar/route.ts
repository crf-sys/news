import { sql } from "@/lib/db";
import { notifyNewSubscriber, SITE } from "@/lib/newsletter";

export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get("token") ?? "";
  const rows = t.length > 20
    ? await sql`update subscribers set confirmed_at = now(), confirm_token = null where confirm_token = ${t} returning email, region`
    : [];
  if (rows.length) {
    const [{ n }] = await sql`select count(*)::int as n from subscribers where confirmed_at is not null and unsubscribed_at is null`;
    // El aviso interno nunca debe impedir la confirmación.
    await notifyNewSubscriber(rows[0].email as string, rows[0].region as string, n as number).catch((e) => console.error("Aviso de registro", e));
  }
  return Response.redirect(`${SITE}/newsletter?${rows.length ? "confirmado=1" : "error=enlace"}`, 303);
}
