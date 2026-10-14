import type { Cluster } from "./cluster";
import type { Story } from "../types";

// ETAPA 4 — El "informe objetivo" de cada tema. Un LLM con salida estructurada (zod)
// recibe los extractos de todos los medios del cluster y produce:
//   - titular neutro propio (nunca copiado),
//   - afirmaciones clasificadas: "hecho" (≥3 medios de distinto signo lo sostienen),
//     "disputado" (medios lo contradicen) u "opinion" (valoración, adjetivación),
//   - cómo lo enfoca cada bloque ideológico,
//   - contexto necesario y preguntas abiertas.
// Regla dura: cada afirmación debe citar los medios de los que sale. Sin cita, no se publica.

export async function analyzeCluster(cluster: Cluster, rank: number): Promise<Story> {
  // TODO: generateObject() con AI SDK + esquema Story.
  void cluster;
  throw new Error(`analyzeCluster no implementado (rank ${rank})`);
}
