import { currentUser } from "@clerk/nextjs/server";

// Emails con acceso al back-office. Se amplía con la variable ADMIN_EMAILS (separados por comas).
const ALLOWED = (process.env.ADMIN_EMAILS ?? "crf@advancing.es").split(",").map((e) => e.trim().toLowerCase());

export async function adminEmail(): Promise<string | null> {
  const user = await currentUser();
  const emails = user?.emailAddresses.filter((e) => e.verification?.status === "verified").map((e) => e.emailAddress.toLowerCase()) ?? [];
  return emails.find((e) => ALLOWED.includes(e)) ?? null;
}

/** Para server actions: lanza si quien llama no es editor. */
export async function requireAdmin(): Promise<string> {
  const email = await adminEmail();
  if (!email) throw new Error("No autorizado");
  return email;
}
