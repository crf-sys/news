import { sql } from "./db";

// Medios con reserva que se han activado a mano en /admin/licencias (vigentes y no revocados), más los
// de la variable LICENSED_OUTLETS (que equivalen a "texto_completo"). Alcances:
//  - "titulares": solo titular, enlace y posición en portada; la IA analiza únicamente el titular.
//  - "texto_completo": también entradilla y texto.
// Cada proceso llama a loadLicenses() al empezar; después se consulta de forma síncrona.
export type LicenseScope = "titulares" | "texto_completo";
let active = new Map<string, LicenseScope>();

export async function loadLicenses(): Promise<Set<string>> {
  const rows = await sql`
    select outlet_id, scope from outlet_licenses
    where revoked_at is null and valid_from <= current_date and (valid_until is null or valid_until >= current_date)`;
  active = new Map();
  for (const r of rows) {
    const scope = (r.scope === "texto_completo" ? "texto_completo" : "titulares") as LicenseScope;
    if (active.get(r.outlet_id as string) !== "texto_completo") active.set(r.outlet_id as string, scope);
  }
  return licensedOutletIds();
}

function envIds() {
  return (process.env.LICENSED_OUTLETS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

export function licensedOutletIds(): Set<string> {
  return new Set([...envIds(), ...active.keys()]);
}

/** Alcance de la licencia de un medio con reserva, o null si no está activado. */
export function licenseScope(outletId: string): LicenseScope | null {
  const scope: LicenseScope | null = envIds().includes(outletId) ? "texto_completo" : (active.get(outletId) ?? null);
  // HEADLINES_ONLY=1 limita cualquier licencia a "titulares" en esa ejecución (p. ej. vistas previas).
  return scope && process.env.HEADLINES_ONLY === "1" ? "titulares" : scope;
}
