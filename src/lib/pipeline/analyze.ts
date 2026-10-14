import { generateText, isStepCount, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";
import { MODELS } from "../ai/models";
import { COLUMNISTS, outlet, LEAN_LABEL } from "../sources";
import type { Story } from "../types";
import type { Cluster } from "./cluster";
import { verificationTools } from "./tools";

// ETAPA 4 — Informe objetivo de cada tema. Un agente con herramientas lee las piezas, las compara,
// y cuando hay discrepancias o cifras dudosas acude a fuentes primarias, verificadores y hemeroteca.
// El criterio completo está en docs/CRITERIO-OBJETIVIDAD.md y debe mantenerse sincronizado con CRITERIO.

export const CRITERIO = `
Eres el analista de Ágora, un medio cuyo único compromiso es la objetividad verificable. No tienes línea editorial.

CÓMO TRABAJAS
1. Lee todas las piezas del tema. Si un medio permite la lectura completa (herramienta leer_articulo), lee al menos las 2 piezas más completas para entender bien el hecho; del resto usa titular y extracto.
2. Extrae las afirmaciones relevantes y compáralas entre medios. Detecta: cifras distintas, hechos que solo cuenta un medio, omisiones, y adjetivación o lenguaje cargado.
3. Ante CUALQUIER duda (cifras que no cuadran, una afirmación sostenida por un solo medio, datos oficiales, votaciones, normas, resoluciones judiciales, encuestas) acude a las fuentes:
   - buscar_fuente_primaria (BOE, Congreso, INE, CIS, Poder Judicial, Banco de España, AIReF, UE…) para datos y documentos oficiales;
   - buscar_verificadores (Newtral, Maldita, EFE Verifica) para bulos o afirmaciones ya verificadas;
   - hemeroteca para antecedentes y para ver si algo cambió respecto a lo publicado antes.
   No hagas más de 6 búsquedas en total. Si no puedes comprobar algo, dilo: "no_verificable".
4. Redacta el informe.

REGLAS DE CLASIFICACIÓN (estrictas)
- "hecho": lo sostienen al menos 2 medios independientes y no lo contradice ninguno, o está confirmado en fuente primaria.
- "disputado": hay medios o fuentes que lo contradicen, o las cifras no coinciden. Explica la discrepancia.
- "opinion": es una valoración, predicción, calificativo o interpretación, aunque la publique un medio en una noticia.
- Una afirmación de un solo medio sin confirmar NO es "hecho": márcala "disputado" con la nota "solo lo publica X" o deja verificación "no_verificable".

ESCRITURA
- Titular y entradilla propios, neutros, descriptivos, sin adjetivos valorativos ni verbos de juicio ("arremete", "carga contra", "se hunde"). Nunca copies frases de los medios.
- Atribuye siempre: "según el INE", "según elDiario.es". Usa los ids de medio exactos que se te dan.
- Enfoques: describe en qué pone el foco cada bloque (izquierda/centro/derecha según la línea editorial del medio) sin juzgar cuál es correcto. Si un bloque no ha cubierto el tema, no lo inventes.
- Lenguaje cargado: señala términos valorativos usados por un medio y su alternativa neutra.
- Omisiones: datos relevantes que un medio no menciona y otros sí.
- Contexto: solo hechos comprobables que ayuden a entender (antecedentes, normas, cifras previas).
- Confianza del informe: "alta" si hay ≥3 medios y verificación primaria; "media" si hay 2 medios o verificación parcial; "baja" en otro caso.
- Escribe en castellano, frases cortas, sin jerga.
`;

const schema = z.object({
  headline: z.string().describe("Titular neutro propio, máx. 110 caracteres"),
  dek: z.string().describe("Entradilla neutra de 1-2 frases"),
  section: z.enum(["politica", "economia", "internacional", "sociedad", "tribunales"]),
  claims: z.array(z.object({
    text: z.string(),
    status: z.enum(["hecho", "disputado", "opinion"]),
    outletIds: z.array(z.string()),
    verification: z.object({
      result: z.enum(["confirmado", "contradicho", "no_verificable"]),
      sourceName: z.string().optional(),
      sourceUrl: z.string().optional(),
      note: z.string(),
    }).optional(),
  })).min(2).max(10),
  framings: z.array(z.object({
    lean: z.enum(["izquierda", "centro", "derecha"]),
    summary: z.string(),
    outletIds: z.array(z.string()),
  })),
  opinions: z.array(z.object({
    author: z.string().describe("Autor de la pieza de opinión, tal como aparece"),
    outletId: z.string(),
    take: z.string().describe("Su tesis en una frase neutra, sin citarle literalmente"),
    url: z.string(),
  })),
  loadedLanguage: z.array(z.object({ outletId: z.string(), term: z.string(), neutral: z.string() })),
  omissions: z.array(z.object({ outletId: z.string(), note: z.string() })),
  context: z.array(z.string()).max(4),
  openQuestions: z.array(z.string()).max(3),
  confidence: z.enum(["alta", "media", "baja"]),
});

const blocOf = (lean: number | undefined) => lean === undefined ? null : (lean < 0 ? "izquierda" : lean > 0 ? "derecha" : "centro");

export interface Usage { input: number; output: number; steps: number }

export async function analyzeCluster(cluster: Cluster, rank: number, model: string): Promise<{ story: Story; usage: Usage }> {
  const pieces = cluster.articles.slice(0, 20).map((a) => {
    const o = outlet(a.outlet_id);
    return `- [${a.kind === "opinion" ? "OPINIÓN" : "NOTICIA"}] medio=${o.id} (${o.name}, línea ${o.lean === undefined ? "sin calibrar" : LEAN_LABEL[o.lean]}; lectura completa: ${o.access === "auto" || o.access === "licenciado" ? "sí" : "no"})\n  ${a.title}\n  ${a.excerpt ?? ""}\n  ${a.url}`;
  });

  // Un reintento si el modelo devuelve un objeto que no cumple el esquema.
  const run = () => generateText({
    model,
    system: CRITERIO,
    tools: verificationTools,
    stopWhen: isStepCount(14),
    output: Output.object({ schema }),
    prompt: `Fecha de hoy: ${new Date().toLocaleDateString("es-ES", { timeZone: "Europe/Madrid", dateStyle: "full" })}.\n\nPiezas del tema:\n${pieces.join("\n")}\n\nElabora el informe objetivo.`,
  });
  const result = await run().catch((e) => (NoObjectGeneratedError.isInstance(e) ? run() : Promise.reject(e)));
  const { output } = result;
  const usage = { input: result.totalUsage.inputTokens ?? 0, output: result.totalUsage.outputTokens ?? 0, steps: result.steps.length };

  const valid = new Set(cluster.outlets);
  const known = (ids: string[]) => ids.filter((id) => valid.has(id));
  const spectrum = { izquierda: 0, centro: 0, derecha: 0 };
  for (const id of cluster.outlets) {
    const b = blocOf(outlet(id).lean);
    if (b) spectrum[b]++;
  }

  const story: Story = {
    id: slug(output.headline),
    rank,
    section: output.section,
    headline: output.headline,
    dek: output.dek,
    coverage: cluster.outlets.map((outletId) => ({ outletId })),
    claims: output.claims.map((c) => ({ ...c, outletIds: known(c.outletIds) })),
    framings: output.framings.map((f) => ({ ...f, outletIds: known(f.outletIds) })).filter((f) => f.outletIds.length),
    opinions: output.opinions.map((o) => ({
      ...o,
      columnistId: COLUMNISTS.find((c) => c.name.toLowerCase() === o.author.toLowerCase())?.id,
    })),
    context: output.context,
    openQuestions: output.openQuestions,
    articles: [],
    sources: cluster.articles.map((a) => ({ outletId: a.outlet_id, url: a.url, title: a.title })),
    objectivity: {
      outlets: cluster.outlets.length,
      spectrum,
      verified: output.claims.filter((c) => c.verification?.result === "confirmado").length,
      loadedLanguage: output.loadedLanguage.filter((l) => valid.has(l.outletId)),
      omissions: output.omissions.filter((o) => valid.has(o.outletId)),
      confidence: output.confidence,
    },
  };
  return { story, usage };
}

const slug = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
