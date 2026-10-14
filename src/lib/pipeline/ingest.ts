import type { Article, Outlet } from "../types";
import { ALL_OUTLETS } from "../sources";
import { licenseScope, licensedOutletIds, loadLicenses } from "../licenses";

// ETAPA 1 — Ingesta. Un único motor para todos los medios; lo que cambia por medio es su
// configuración en sources.ts. Solo se leen automáticamente los medios con access "auto" o
// "licenciado": el resto entra por el panel de edición (lectura humana) hasta tener licencia.
//
// Del contenido solo se conserva: titular, URL, fecha, autor, sección y un extracto breve.
// Frecuencia prevista: 3–4 veces al día. Identificación honesta del bot (USER_AGENT) y
// respeto a robots.txt.

export const USER_AGENT = "Mozilla/5.0 (compatible; AgoraBot/0.1; +https://agora10.com/metodologia)";
const EXCERPT_MAX = 280;

export const readableOutlets = () => {
  const licensed = licensedOutletIds();
  const metadataOnly = new Set((process.env.METADATA_ONLY_OUTLETS ?? "").split(",").map((id) => id.trim()).filter(Boolean));
  return ALL_OUTLETS.filter((o) => o.access === "auto" || o.access === "licenciado" || licensed.has(o.id) || metadataOnly.has(o.id));
};

export interface IngestReport {
  outletId: string;
  feed: string;
  ok: boolean;
  items: number;
  error?: string;
}

export async function ingestRss(): Promise<{ articles: Article[]; report: IngestReport[] }> {
  await loadLicenses();
  const jobs = readableOutlets().flatMap((o) => o.rss.map((feed) => ({ outlet: o, feed })));
  const results = await Promise.all(jobs.map(({ outlet, feed }) => readFeed(outlet, feed)));

  const seen = new Set<string>();
  const articles: Article[] = [];
  for (const r of results) {
    for (const a of r.articles) {
      const key = `${a.outletId}:${a.url}`; // la misma pieza aparece en varios feeds de sección
      if (seen.has(key)) continue;
      seen.add(key);
      articles.push(a);
    }
  }
  articles.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return { articles, report: results.map((r) => r.report) };
}

async function readFeed(outlet: Outlet, feed: string): Promise<{ articles: Article[]; report: IngestReport }> {
  try {
    const res = await fetch(feed, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await decode(res);
    const headlineOnly = outlet.access === "licencia" && licenseScope(outlet.id) !== "texto_completo";
    // Medios activados solo para titulares: no se guarda la entradilla.
    const articles = parseRss(xml).map((it) => toArticle(outlet, feed, headlineOnly ? { ...it, description: "" } : it));
    return { articles, report: { outletId: outlet.id, feed, ok: true, items: articles.length } };
  } catch (e) {
    return { articles: [], report: { outletId: outlet.id, feed, ok: false, items: 0, error: String(e) } };
  }
}

/** Algunos feeds (RTVE) vienen en ISO-8859-1. */
async function decode(res: Response): Promise<string> {
  const buf = await res.arrayBuffer();
  const head = new TextDecoder("ascii").decode(buf.slice(0, 200));
  const charset = /encoding="([^"]+)"/i.exec(head)?.[1] ?? /charset=([\w-]+)/i.exec(res.headers.get("content-type") ?? "")?.[1] ?? "utf-8";
  return new TextDecoder(charset.toLowerCase()).decode(buf);
}

interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  creator?: string;
  categories: string[];
}

export function parseRss(xml: string): RssItem[] {
  return [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/g)].map(([item]) => ({
    title: tag(item, "title"),
    link: tag(item, "link") || tag(item, "guid"),
    description: tag(item, "description"),
    pubDate: tag(item, "pubDate") || tag(item, "dc:date"),
    creator: tag(item, "dc:creator") || tag(item, "author") || undefined,
    categories: [...item.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/g)].map((m) => clean(m[1])),
  }));
}

function tag(xml: string, name: string): string {
  const m = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(xml);
  return m ? clean(m[1]) : "";
}

function clean(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function toArticle(outlet: Outlet, feed: string, it: RssItem): Article {
  const url = it.link.split("#")[0];
  const date = new Date(it.pubDate);
  const shortened = it.description.slice(0, EXCERPT_MAX);
  const excerpt = it.description.length > EXCERPT_MAX ? `${shortened.slice(0, shortened.lastIndexOf(" ") > 0 ? shortened.lastIndexOf(" ") : EXCERPT_MAX)}…` : it.description;
  return {
    id: `${outlet.id}:${url}`,
    outletId: outlet.id,
    url,
    title: it.title,
    excerpt,
    publishedAt: isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(),
    via: "rss",
    kind: /opini/i.test(feed) || it.categories.some((c) => /opini|tribuna|columna/i.test(c)) ? "opinion" : "noticia",
    author: it.creator,
    section: it.categories[0],
  };
}

export async function ingestEmail(raw: { from: string; subject: string; html: string }): Promise<Article[]> {
  // TODO (F4): mapear remitente → outletId y extraer enlaces + titulares de la newsletter.
  void raw;
  return [];
}

export async function scrapeFrontPages(): Promise<Record<string, string[]>> {
  // TODO (F1b): orden de portada, solo para medios "auto"/"licenciado" y respetando robots.txt.
  return {};
}
