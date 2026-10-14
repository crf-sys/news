import { sql } from "@/lib/db";
import { SITE } from "@/lib/newsletter";

export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get("token") ?? "";
  const rows = t.length > 20
    ? await sql`update subscribers set confirmed_at = now(), confirm_token = null where confirm_token = ${t} returning email`
    : [];
  return Response.redirect(`${SITE}/newsletter?${rows.length ? "confirmado=1" : "error=enlace"}`, 303);
}
