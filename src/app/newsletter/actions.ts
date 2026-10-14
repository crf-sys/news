"use server";

import { redirect } from "next/navigation";

// TODO: guardar en Postgres con doble opt-in (email de confirmación) y alta en Resend Audiences.
export async function subscribe(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) redirect("/newsletter?error=1");
  redirect("/newsletter?ok=1");
}
