import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { sql } from "./db";

// Límite de peticiones por IP para formularios públicos (ventana fija). La IP nunca se guarda:
// solo un hash con sal secreta, que además se purga a las 24 h.
export async function rateLimit(action: string, limit: number, windowMinutes = 60): Promise<boolean> {
  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconocida";
  const key = `${action}:${createHash("sha256").update(`${process.env.CRON_SECRET ?? ""}:${ip}`).digest("hex").slice(0, 32)}`;
  const windowStart = new Date(Math.floor(Date.now() / (windowMinutes * 60_000)) * windowMinutes * 60_000).toISOString();
  const [row] = await sql`
    insert into rate_limits (key, window_start, count) values (${key}, ${windowStart}, 1)
    on conflict (key, window_start) do update set count = rate_limits.count + 1
    returning count`;
  if (Math.random() < 0.02) await sql`delete from rate_limits where window_start < now() - interval '24 hours'`;
  return (row.count as number) <= limit;
}
