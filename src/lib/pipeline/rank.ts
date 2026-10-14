import type { Cluster } from "./cluster";

// ETAPA 3 — Elegir las 10 del día. Puntuación transparente y publicada en /metodologia:
//   score = 0.5 · (nº de medios que lo llevan / 10)
//         + 0.3 · prominencia media en portada (apertura = 1, desaparece tras el puesto 10)
//         + 0.2 · nº de columnistas del panel que escriben sobre ello
// Se fuerza diversidad: como máximo 4 temas de la misma sección.

export function rankClusters(clusters: Cluster[], top = 10): Cluster[] {
  // TODO: implementar la fórmula con datos reales.
  return clusters.slice(0, top);
}
