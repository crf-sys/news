import { createHash } from "node:crypto";
import { ALL_OUTLETS } from "./sources";
import type { Article, Outlet } from "./types";
import { ingestRss, USER_AGENT } from "./pipeline/ingest";

export type RawItem = {
  outlet: string;
  url: string;
  title: string;
  published_at: string;
  rights: "publico" | "licenciado" | "sin_licencia";
  subtitle?: string;
  author?: string;
  section?: string;
  kind: Article["kind"];
};

export type FrontPageSnapshot = {
  outlet: string;
  captured_at: string;
  positions: { position: number; url: string; title?: string }[];
};

export type IngestBatch = {
  batch_id: string;
  provider: string;
  items: RawItem[];
  snapshots: FrontPageSnapshot[];
};

export type CoverageEntry = {
  outlet: string;
  state: "collected" | "metadata_only" | "blocked_license" | "missing_feed" | "failed";
  items: number;
  snapshot_positions: number;
  detail?: string;
};

const PROVIDER = "agora-collector";
const MAX_ITEMS = 500;
const MAX_POSITIONS = 200;

function licensedIds() {
  return new Set((process.env.LICENSED_OUTLETS ?? "").split(",").map((id) => id.trim()).filter(Boolean));
}

function metadataOnlyIds() {
  return new Set((process.env.METADATA_ONLY_OUTLETS ?? "").split(",").map((id) => id.trim()).filter(Boolean));
}

export function collectibleOutlets() {
  const licensed = licensedIds();
  const metadataOnly = metadataOnlyIds();
  return ALL_OUTLETS.filter((outlet) => outlet.access === "auto" || outlet.access === "licenciado" || licensed.has(outlet.id) || metadataOnly.has(outlet.id));
}

function rightsFor(outlet: Outlet): RawItem["rights"] {
  if (outlet.access === "licenciado" || licensedIds().has(outlet.id)) return "licenciado";
  if (metadataOnlyIds().has(outlet.id)) return "sin_licencia";
  return "publico";
}

function itemFromArticle(article: Article): RawItem {
  const outlet = ALL_OUTLETS.find((candidate) => candidate.id === article.outletId)!;
  return {
    outlet: article.outletId,
    url: article.url,
    title: article.title,
    published_at: article.publishedAt,
    rights: rightsFor(outlet),
    subtitle: article.excerpt || undefined,
    author: article.author,
    section: article.section,
    kind: article.kind,
  };
}

function decodeHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalArticleUrl(rawHref: string, base: URL): string | undefined {
  try {
    const url = new URL(rawHref, base);
    if (url.protocol !== "https:" && url.protocol !== "http:") return;
    if (url.hostname.replace(/^www\./, "") !== base.hostname.replace(/^www\./, "")) return;
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|output|ref|source|fbclid|gclid)/i.test(key)) url.searchParams.delete(key);
    }
    const path = url.pathname.toLowerCase();
    if (path === "/" || /\.(?:jpg|jpeg|png|gif|svg|webp|xml|rss|pdf)$/i.test(path)) return;
    if (/\/(?:autor|autores|tag|tags|buscar|buscador|login|registro|suscrip|newsletter|podcast|programacion)(?:\/|$)/i.test(path)) return;
    const segments = path.split("/").filter(Boolean);
    if (segments.length < 2 && !/\d{4}/.test(path)) return;
    return url.toString();
  } catch {
    return;
  }
}

export function extractFrontPagePositions(html: string, pageUrl: string) {
  const base = new URL(pageUrl);
  // El orden editorial vive en <main>; usar toda la página antepondría menú, cuenta y pie.
  const editorialHtml = /<main\b[\s\S]*?<\/main>/i.exec(html)?.[0] ?? html;
  const positions: FrontPageSnapshot["positions"] = [];
  const seen = new Set<string>();
  const anchors = editorialHtml.matchAll(/<a\b[^>]*\bhref\s*=\s*(?:"([^"]+)"|'([^']+)')[^>]*>([\s\S]*?)<\/a>/gi);
  for (const match of anchors) {
    const url = canonicalArticleUrl(match[1] || match[2], base);
    const title = decodeHtml(match[3]);
    if (!url || seen.has(url) || title.length < 12 || title.length > 400) continue;
    seen.add(url);
    positions.push({ position: positions.length + 1, url, title });
    if (positions.length >= MAX_POSITIONS) break;
  }
  return positions;
}

async function snapshot(outlet: Outlet, capturedAt: string): Promise<FrontPageSnapshot> {
  const pageUrl = outlet.frontPageUrl ?? outlet.url;
  const response = await fetch(pageUrl, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`portada HTTP ${response.status}`);
  const positions = extractFrontPagePositions(await response.text(), pageUrl);
  if (!positions.length) throw new Error("portada sin posiciones reconocibles");
  return { outlet: outlet.id, captured_at: capturedAt, positions };
}

function batchId(capturedAt: string, index: number, items: RawItem[], snapshots: FrontPageSnapshot[]) {
  const digest = createHash("sha256")
    .update(JSON.stringify({ capturedAt, index, urls: items.map((item) => item.url), outlets: snapshots.map((item) => item.outlet) }))
    .digest("hex")
    .slice(0, 16);
  return `${PROVIDER}-${capturedAt.replace(/[:.]/g, "-")}-${index}-${digest}`.slice(0, 100);
}

export async function collectAll(capturedAt = new Date().toISOString()): Promise<{ batches: IngestBatch[]; coverage: CoverageEntry[] }> {
  const enabled = collectibleOutlets();
  const enabledIds = new Set(enabled.map((outlet) => outlet.id));
  const { articles, report } = await ingestRss();
  const items = articles.filter((article) => enabledIds.has(article.outletId)).map(itemFromArticle);
  const snapshotResults = await Promise.allSettled(enabled.map((outlet) => snapshot(outlet, capturedAt)));
  const snapshots: FrontPageSnapshot[] = [];
  const coverage: CoverageEntry[] = ALL_OUTLETS.map((outlet) => {
    if (!enabledIds.has(outlet.id)) return { outlet: outlet.id, state: "blocked_license", items: 0, snapshot_positions: 0 };
    const outletItems = items.filter((item) => item.outlet === outlet.id).length;
    const result = snapshotResults[enabled.findIndex((candidate) => candidate.id === outlet.id)];
    if (result?.status === "fulfilled") snapshots.push(result.value);
    const feedReports = report.filter((entry) => entry.outletId === outlet.id);
    if (!outlet.rss.length) return { outlet: outlet.id, state: "missing_feed", items: outletItems, snapshot_positions: result?.status === "fulfilled" ? result.value.positions.length : 0, detail: metadataOnlyIds().has(outlet.id) ? "Aprobado para metadatos, pero sin fuente pública configurada" : undefined };
    if (feedReports.length && feedReports.every((entry) => !entry.ok)) return { outlet: outlet.id, state: "failed", items: 0, snapshot_positions: result?.status === "fulfilled" ? result.value.positions.length : 0, detail: feedReports.map((entry) => entry.error).join("; ") };
    return { outlet: outlet.id, state: metadataOnlyIds().has(outlet.id) ? "metadata_only" : "collected", items: outletItems, snapshot_positions: result?.status === "fulfilled" ? result.value.positions.length : 0, detail: result?.status === "rejected" ? String(result.reason) : undefined };
  });

  const batches: IngestBatch[] = [];
  const pages = Math.max(1, Math.ceil(items.length / MAX_ITEMS));
  for (let index = 0; index < pages; index++) {
    const batchItems = items.slice(index * MAX_ITEMS, (index + 1) * MAX_ITEMS);
    const batchSnapshots = index === 0 ? snapshots.slice(0, 60) : [];
    batches.push({ batch_id: batchId(capturedAt, index, batchItems, batchSnapshots), provider: PROVIDER, items: batchItems, snapshots: batchSnapshots });
  }
  return { batches, coverage };
}

export async function deliverBatch(batch: IngestBatch) {
  const endpoint = process.env.INGEST_ENDPOINT ?? "https://agora10.com/api/ingest";
  const key = process.env.INGEST_API_KEY;
  if (!key) throw new Error("INGEST_API_KEY no configurada");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "User-Agent": USER_AGENT },
    body: JSON.stringify(batch),
    signal: AbortSignal.timeout(240_000),
  });
  const result = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
  if (response.status >= 500 || response.status === 429) throw new Error(`Fallo temporal de entrega: HTTP ${response.status}`);
  if (response.status === 400 || response.status === 401) throw new Error(`Fallo permanente de entrega: HTTP ${response.status} ${JSON.stringify(result)}`);
  if (!response.ok && response.status !== 207) throw new Error(`Entrega rechazada: HTTP ${response.status}`);
  return { status: response.status, result };
}
