import { sql } from "./db";

// Medios con licencia activa: los registrados en /admin/licencias (vigentes y no revocados)
// más los de la variable LICENSED_OUTLETS. Cada proceso llama a loadLicenses() al empezar y
// después consulta licensedOutletIds() de forma síncrona.
let active = new Set<string>();

export async function loadLicenses(): Promise<Set<string>> {
  const rows = await sql`
    select distinct outlet_id from outlet_licenses
    where revoked_at is null and valid_from <= current_date and (valid_until is null or valid_until >= current_date)`;
  active = new Set(rows.map((r) => r.outlet_id as string));
  return licensedOutletIds();
}

export function licensedOutletIds(): Set<string> {
  const env = (process.env.LICENSED_OUTLETS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return new Set([...env, ...active]);
}
