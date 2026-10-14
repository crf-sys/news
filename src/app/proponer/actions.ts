"use server";

import { redirect } from "next/navigation";
import { sql } from "@/lib/db";

const KINDS = ["columnista", "lider_opinion", "periodista", "academico", "think_tank"];

export async function propose(formData: FormData) {
  const f = (k: string) => String(formData.get(k) ?? "").trim();
  if (f("website")) redirect("/proponer?ok=1"); // honeypot anti-spam: los humanos no ven este campo
  const email = f("email").toLowerCase();
  const consent = formData.get("consent") === "on";
  if (!f("name") || f("reason").length < 20 || !KINDS.includes(f("kind"))) redirect("/proponer?error=campos");
  if (email && (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !consent)) redirect("/proponer?error=email");

  await sql`
    insert into voice_proposals (name, url, kind, reason, email, consent_at)
    values (${f("name").slice(0, 120)}, ${f("url").slice(0, 300) || null}, ${f("kind")}, ${f("reason").slice(0, 1500)},
            ${email || null}, ${email ? new Date().toISOString() : null})`;
  redirect("/proponer?ok=1");
}
