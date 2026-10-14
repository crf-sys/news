import { gateway, tool } from "ai";
import { z } from "zod";
import { sql } from "../db";
import { ALL_OUTLETS } from "../sources";
import { USER_AGENT, readableOutlets } from "./ingest";

// Herramientas del agente verificador. Cada una deja rastro (URL) para que toda afirmación
// verificada en la web pueda enlazar a su fuente.

/** Fuentes primarias oficiales: aquí se confirman cifras, normas, votaciones y resoluciones. */
export const PRIMARY_SOURCES = [
  "boe.es", "congreso.es", "senado.es", "lamoncloa.gob.es", "ine.es", "cis.es",
  "poderjudicial.es", "tribunalconstitucional.es", "bde.es", "airef.es", "seg-social.es",
  "hacienda.gob.es", "juntaelectoralcentral.es", "europa.eu", "eurostat.ec.europa.eu",
];

/** Verificadores independientes adheridos a la red IFCN. */
export const FACT_CHECKERS = ["newtral.es", "maldita.es", "verifica.efe.com"];

const readableDomains = () => readableOutlets().map((o) => new URL(o.url).hostname.replace(/^www\./, ""));

export const verificationTools = {
  buscar_fuente_primaria: gateway.tools.perplexitySearch({
    maxResults: 5,
    maxTokensPerPage: 1024,
    searchLanguageFilter: ["es"],
    searchDomainFilter: PRIMARY_SOURCES,
  }),

  buscar_verificadores: gateway.tools.perplexitySearch({
    maxResults: 5,
    maxTokensPerPage: 768,
    searchDomainFilter: FACT_CHECKERS,
  }),

  hemeroteca: tool({
    description:
      "Busca en la hemeroteca propia de Ágora (piezas de los últimos 180 días de los medios del panel) para ver antecedentes, " +
      "qué se publicó antes sobre el tema o si una cifra ha cambiado. Devuelve titular, medio, fecha y URL.",
    inputSchema: z.object({
      palabras: z.array(z.string()).min(1).max(5).describe("Palabras clave que deben aparecer en el titular o extracto"),
      dias: z.number().int().min(1).max(180).default(60),
    }),
    execute: async ({ palabras, dias }) => {
      const patterns = palabras.map((p) => `%${p}%`);
      const rows = await sql`
        select outlet_id, title, excerpt, url, published_at from articles
        where published_at > now() - make_interval(days => ${dias})
          and (select bool_and(title ilike p or excerpt ilike p) from unnest(${patterns}::text[]) p)
        order by published_at desc limit 12`;
      return rows;
    },
  }),

  leer_articulo: tool({
    description:
      "Lee el texto completo de una pieza para interpretarla bien. SOLO funciona con medios cuyas condiciones lo permiten; " +
      "para el resto, trabaja con titular y extracto. Úsalo para entender, nunca para copiar frases al informe.",
    inputSchema: z.object({ url: z.string().url() }),
    execute: async ({ url }) => {
      // Si la pieza llegó con texto completo por la API (y con derechos), se usa ese texto.
      const [stored] = await sql`
        select a.body from articles a join outlets o on o.id = a.outlet_id
        where a.url = ${url} and a.body is not null and (o.access <> 'licencia' or a.rights = 'licenciado') limit 1`;
      if (stored) return { url, texto: String(stored.body).slice(0, 9000) };
      const host = new URL(url).hostname.replace(/^www\./, "");
      if (!readableDomains().includes(host)) {
        return { error: "Este medio no permite la lectura automatizada. Usa solo titular y extracto." };
      }
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(15_000) });
      if (!res.ok) return { error: `HTTP ${res.status}` };
      const html = await res.text();
      const body = /<article[\s\S]*?<\/article>/i.exec(html)?.[0] ?? html;
      const text = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
        .map((m) => m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim())
        .filter((t) => t.length > 40)
        .join("\n");
      return { url, texto: text.slice(0, 9000) };
    },
  }),
};

export const outletName = (id: string) => ALL_OUTLETS.find((o) => o.id === id)?.name ?? id;
