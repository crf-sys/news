"use server";

import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { CONSENT_TEXT, sendConfirmation, token } from "@/lib/newsletter";
import { ACTIVE_REGIONS } from "@/lib/regions";

// Registro: email + aceptación de privacidad → se guarda y se envía el email de confirmación (doble opt-in).
export async function subscribe(formData: FormData) {
  if (!(await rateLimit("newsletter", 5))) redirect("/newsletter?error=limite");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const region = String(formData.get("region") ?? "es");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) redirect("/newsletter?error=email");
  if (formData.get("consent") !== "on") redirect("/newsletter?error=consentimiento");
  const reg = ACTIVE_REGIONS.some((r) => r.id === region) ? region : "es";

  const [row] = await sql`select confirmed_at, unsubscribed_at, consent_at from subscribers where email = ${email}`;
  if (row?.confirmed_at && !row.unsubscribed_at) {
    await sql`update subscribers set region = ${reg} where email = ${email}`;
    redirect("/newsletter?ok=ya");
  }
  const confirmToken = token();
  await sql`
    insert into subscribers (email, consent_at, consent_text, region, confirm_token, unsubscribe_token)
    values (${email}, now(), ${CONSENT_TEXT}, ${reg}, ${confirmToken}, ${token()})
    on conflict (email) do update set consent_at = now(), consent_text = excluded.consent_text, region = excluded.region,
      confirm_token = excluded.confirm_token, unsubscribed_at = null, confirmed_at = null`;
  const { error } = await sendConfirmation(email, confirmToken);
  if (error) console.error("Error enviando confirmación", error.message);
  redirect(row && !row.unsubscribed_at ? "/newsletter?ok=reenviado" : "/newsletter?ok=1");
}
