import { generateText, Output } from "ai";
import { z } from "zod";
import { MODELS } from "../ai/models";
import type { Cluster } from "./cluster";
import { outletName } from "./tools";

// ETAPA 3 — Elegir las 10 del día. Criterio principal y público: CUÁNTOS MEDIOS DISTINTOS la cuentan.
//  1. Orden: nº de medios distintos → nº de piezas → actualidad (solo para desempatar).
//  2. Un modelo descarta lo que no es actualidad de interés público (deportes, famosos, sucesos menores,
//     servicio) y fusiona duplicados. NO reordena ni añade temas: el orden final vuelve a ser por cobertura.

export function score(c: Cluster): number {
  const newest = Math.max(...c.articles.map((a) => new Date(a.published_at).getTime()));
  const hoursOld = (Date.now() - newest) / 3_600_000;
  return c.outlets.length * 1000 + Math.min(c.articles.length, 99) * 10 + Math.max(0, 9 - hoursOld / 4);
}

export async function rankClusters(clusters: Cluster[], top = 10): Promise<Cluster[]> {
  const candidates = clusters
    .map((c) => ({ c, s: score(c) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 30);
  if (candidates.length <= top) return candidates.map((x) => x.c);

  const { output } = await generateText({
    model: MODELS.analysisRegional,
    output: Output.object({
      schema: z.object({
        elegidos: z.array(z.object({
          candidato: z.number().int().describe("Número del candidato"),
          fusionarCon: z.array(z.number().int()).describe("Otros candidatos que son el mismo tema"),
        })).max(top),
      }),
    }),
    system:
      "Eres el editor de portada de un medio de cultura política. Eliges las noticias de mayor interés público: política, " +
      "economía, instituciones, tribunales, internacional, sociedad con impacto colectivo. Descarta deportes, famosos, " +
      "sucesos sin relevancia pública, contenido de servicio (tiempo, loterías, horóscopo) y piezas promocionales. " +
      "No valores ideológicamente. El orden lo marca el número de medios que cubren cada tema y ya viene dado: tu trabajo es solo descartar lo que no sea de interés público y señalar duplicados.",
    prompt: candidates
      .map(({ c, s }, i) => `#${i} (${c.outlets.length} medios, ${c.articles.length} piezas: ${c.outlets.map(outletName).join(", ")})\n` +
        c.articles.slice(0, 4).map((a) => `  - ${a.title}`).join("\n"))
      .join("\n\n") + `\n\nElige hasta ${top} temas, en orden de importancia.`,
  });

  const chosen = output.elegidos
    .filter((e) => candidates[e.candidato])
    .map((e) => {
      const base = candidates[e.candidato].c;
      for (const j of e.fusionarCon) {
        const other = candidates[j]?.c;
        if (!other || other === base) continue;
        base.articles.push(...other.articles);
        for (const o of other.outlets) if (!base.outlets.includes(o)) base.outlets.push(o);
      }
      return base;
    });
  // Orden final siempre por cobertura, aunque el modelo haya devuelto otro.
  return [...new Set(chosen)].sort((a, b) => score(b) - score(a)).slice(0, top);
}
