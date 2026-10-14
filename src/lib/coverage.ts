import { ALL_OUTLETS, outlet } from "./sources";
import type { Story } from "./types";

export type Bloc = "izquierda" | "centro" | "derecha";
const blocOf = (lean: number | undefined): Bloc | null =>
  lean === undefined ? null : lean < 0 ? "izquierda" : lean > 0 ? "derecha" : "centro";

/** Dónde cae una noticia en el espectro según los medios que la cuentan (solo los de línea calibrada). */
export function spectrumOf(story: Story) {
  const leans = story.coverage.map((c) => outlet(c.outletId)?.lean).filter((l): l is NonNullable<typeof l> => l !== undefined);
  const blocs = { izquierda: 0, centro: 0, derecha: 0 } as Record<Bloc, number>;
  for (const l of leans) blocs[blocOf(l)!]++;
  const mean = leans.length ? leans.reduce((a: number, b) => a + b, 0) / leans.length / 2 : 0; // -1 … +1
  // Equilibrio entre lados, en proporción al panel (hay más medios de un lado que de otro):
  // qué parte de los medios de izquierda y qué parte de los de derecha la cuentan.
  // -1 = solo la cuenta la izquierda, +1 = solo la derecha, 0 = la cuentan por igual.
  const region = outlet(story.coverage[0]?.outletId ?? "")?.region ?? "es";
  const panel = ALL_OUTLETS.filter((o) => (o.region ?? "es") === region && o.lean !== undefined);
  const nI = panel.filter((o) => o.lean! < 0).length, nD = panel.filter((o) => o.lean! > 0).length;
  const rI = nI ? blocs.izquierda / nI : 0, rD = nD ? blocs.derecha / nD : 0;
  const balance = rI + rD ? (rD - rI) / (rI + rD) : 0;
  return { mean, balance, blocs, calibrated: leans.length, outlets: story.coverage.length, blindSpot: blindSpot(blocs) };
}

/**
 * Punto ciego: la noticia la cuenta un solo lado del espectro, o la ignora por completo un lado.
 * Solo se marca con al menos 2 medios calibrados, para no sacar conclusiones de un único medio.
 */
function blindSpot(b: Record<Bloc, number>): { label: string; side: "izquierda" | "derecha" } | null {
  const total = b.izquierda + b.centro + b.derecha;
  if (total < 2) return null;
  if (b.izquierda === 0 && b.derecha > 0 && b.centro === 0) return { label: "Solo la cuentan medios de derecha", side: "derecha" };
  if (b.derecha === 0 && b.izquierda > 0 && b.centro === 0) return { label: "Solo la cuentan medios de izquierda", side: "izquierda" };
  if (total >= 3 && b.izquierda === 0 && b.derecha > 0) return { label: "Ignorada por la izquierda", side: "derecha" };
  if (total >= 3 && b.derecha === 0 && b.izquierda > 0) return { label: "Ignorada por la derecha", side: "izquierda" };
  return null;
}
