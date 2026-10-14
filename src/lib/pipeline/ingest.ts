import type { Article } from "../types";
import { OUTLETS } from "../sources";

// ETAPA 1 — Ingesta. Tres canales, de más a menos preferible:
//  1. RSS oficial de cada medio y de cada columnista (legal, estable, con metadatos).
//  2. Newsletters por email: buzón dedicado (p.ej. ingest@agora…) suscrito a cada medio.
//     Un webhook de entrada (Postmark/Resend/SES inbound) llama a /api/ingest/email.
//  3. Portadas web: solo para leer el ORDEN de las piezas en la home (señal de relevancia),
//     respetando robots.txt. Nunca se guarda ni se republica el cuerpo del artículo.
// Del contenido solo se conserva: titular, URL, fecha, autor, sección y un extracto breve.

export async function ingestRss(): Promise<Article[]> {
  const feeds = OUTLETS.flatMap((o) => o.rss.map((url) => ({ outletId: o.id, url })));
  // TODO: fetch + parseo (p.ej. `rss-parser`), normalizar a Article, deduplicar por URL canónica.
  void feeds;
  return [];
}

export async function ingestEmail(raw: { from: string; subject: string; html: string }): Promise<Article[]> {
  // TODO: mapear remitente → outletId, extraer enlaces + titulares del HTML de la newsletter.
  void raw;
  return [];
}

export async function scrapeFrontPages(): Promise<Record<string, string[]>> {
  // TODO: devuelve, por medio, las URLs de portada en orden (1 = apertura).
  return {};
}
