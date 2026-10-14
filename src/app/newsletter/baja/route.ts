import { sql } from "@/lib/db";
import { SITE } from "@/lib/newsletter";

// Baja con un clic: GET desde el enlace del email y POST desde el botón "cancelar suscripción" del gestor de correo.
async function unsubscribe(req: Request) {
  const t = new URL(req.url).searchParams.get("token") ?? "";
  if (t.length > 20) await sql`update subscribers set unsubscribed_at = now() where unsubscribe_token = ${t} and unsubscribed_at is null`;
}

export async function GET(req: Request) {
  await unsubscribe(req);
  return Response.redirect(`${SITE}/newsletter?baja=1`, 303);
}

export async function POST(req: Request) {
  await unsubscribe(req);
  return new Response(null, { status: 200 });
}
