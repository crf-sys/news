"use server";

import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

// TODO: email de confirmación (doble opt-in) antes de enviar la newsletter.
export async function subscribe(formData: FormData) {
  if (!(await rateLimit("newsletter", 5))) redirect("/newsletter?error=1");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) redirect("/newsletter?error=1");
  await sql`insert into subscribers (email) values (${email}) on conflict (email) do nothing`;
  redirect("/newsletter?ok=1");
}
