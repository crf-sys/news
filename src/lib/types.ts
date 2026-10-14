// Modelo de datos de Ágora. Todo lo que se muestra al usuario deriva de estas entidades.

/** Eje ideológico: -2 izquierda … 0 centro … +2 derecha. Provisional, ver /metodologia. */
export type Lean = -2 | -1 | 0 | 1 | 2;

/**
 * Cómo podemos leer cada medio, según sus condiciones legales (ver docs/FUENTES-LEGAL.md):
 *  - auto: sin reserva expresa de minería de textos → RSS automático (solo metadatos + enlace).
 *  - licencia: el medio se reserva la minería de textos (art. 67.3 RDL 24/2021) o bloquea bots de IA
 *    → solo lectura humana desde el panel de edición hasta tener licencia.
 *  - licenciado: hay licencia/permiso por escrito → automático, incluida la zona de suscriptor si lo cubre.
 */
export type OutletAccess = "auto" | "licencia" | "licenciado";

export interface Outlet {
  id: string;
  name: string;
  url: string;
  rss: string[];
  access: OutletAccess;
  /** "es" = nacional; si no, id de la comunidad autónoma (ver regions.ts). */
  region?: string;
  /** Resumen de lo que dicen sus condiciones, con enlace. */
  legal: { note: string; url?: string };
  /** Posición editorial estimada (no la de cada periodista). Vacía = sin calibrar (medios autonómicos). */
  lean?: Lean;
  /** Fuente de esa estimación, para que sea auditable. */
  leanSource: string;
  ownership?: string;
}

/** Tipos de "voz" que se pueden dar de alta desde /admin. */
export type VoiceKind = "columnista" | "lider_opinion" | "periodista" | "academico" | "think_tank";

/** Una voz = cualquier persona cuya opinión seguimos (antes "Columnist"). */
export interface Columnist {
  id: string;
  name: string;
  kind: VoiceKind;
  /** id de Outlet del panel, o "independiente" si su medio no está en el panel (ver outletName). */
  outletId: string;
  outletName?: string;
  authorUrl?: string;
  feedUrl?: string;
  /** Posición MEDIDA a partir de sus textos. Vacía = en calibración. Nunca se rellena a mano. */
  lean?: Lean;
  /** Por qué está en el panel: se publica, por transparencia. */
  inclusionReason?: string;
}

/** Pieza tal como llega de un medio (RSS o newsletter por email). Solo metadatos + extracto breve. */
export interface Article {
  id: string;
  outletId: string;
  columnistId?: string;
  url: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  via: "rss" | "email" | "web" | "api";
  kind: "noticia" | "opinion" | "analisis" | "entrevista";
  /** Posición en portada del medio (1 = apertura). Señal clave para el ranking. */
  frontPageRank?: number;
}

export type ClaimStatus = "hecho" | "disputado" | "opinion";

export interface Claim {
  text: string;
  status: ClaimStatus;
  /** Medios que lo sostienen (para "hecho": nº de fuentes independientes). */
  outletIds: string[];
  /** Comprobación contra fuente primaria o hemeroteca, cuando el agente la ha hecho. */
  verification?: {
    result: "confirmado" | "contradicho" | "no_verificable";
    sourceName?: string;
    sourceUrl?: string;
    note: string;
  };
}

export interface Framing {
  lean: "izquierda" | "centro" | "derecha";
  summary: string;
  outletIds: string[];
}

/** Un "tema" = cluster de artículos de distintos medios sobre el mismo hecho. */
export interface Story {
  id: string;
  rank: number;
  section: "politica" | "economia" | "internacional" | "sociedad" | "tribunales";
  headline: string; // titular neutro generado, no copiado de ningún medio
  dek: string;
  /** Cuántos de los 10 medios lo llevan y en qué posición. */
  coverage: { outletId: string; frontPageRank?: number }[];
  claims: Claim[];
  framings: Framing[];
  /** columnistId solo si el autor está en nuestro panel de voces; si no, se usa author + outletId. */
  opinions: { columnistId?: string; author?: string; outletId?: string; take: string; url: string }[];
  context: string[];
  openQuestions: string[];
  articles: Article[];
  /** Panel de objetividad: lo que se mide de cada tema, siempre a la vista. */
  objectivity?: {
    outlets: number;
    /** Denominador: medios que leemos en ese ámbito. "La cuentan outlets de outletsTotal". */
    outletsTotal?: number;
    spectrum: { izquierda: number; centro: number; derecha: number };
    verified: number;
    loadedLanguage: { outletId: string; term: string; neutral: string }[];
    omissions: { outletId: string; note: string }[];
    confidence: "alta" | "media" | "baja";
  };
  sources?: { outletId: string; url: string; title: string }[];
}

export interface DailyEdition {
  date: string;
  generatedAt: string;
  stories: Story[];
}

/** Un eje de la ficha ideológica. El valor se calcula a partir de sus artículos, no se asigna a mano. */
export interface IdeologyAxis {
  id: "economico" | "social" | "territorial" | "europa" | "institucional";
  label: string;
  poles: [string, string];
  /** -1 … +1, posición media estimada en sus textos. */
  value: number;
  /** 0 … 1: dispersión baja + muchos textos = confianza alta. */
  confidence: number;
  evidence: number; // nº de artículos que tocan el eje
  /** Citas breves (≤ 1 frase) que justifican la posición, con enlace. */
  examples: { quote: string; url: string; date: string }[];
}

export interface ColumnistProfile {
  columnistId: string;
  bio: string;
  since: string;
  frequency: string;
  articlesAnalyzed: number;
  axes: IdeologyAxis[];
  topics: { topic: string; share: number }[];
  /** Tono medio cuando habla de cada actor (-1 crítico … +1 favorable). */
  stance: { actor: string; tone: number; mentions: number }[];
  featured: { title: string; url: string; date: string; why: string; reach?: string }[];
}

/**
 * Nota de lectura humana: un editor lee una pieza (también de medios sin licencia, con su
 * suscripción) y escribe CON SUS PALABRAS qué afirma, cómo lo enfoca y qué valora. La IA trabaja
 * sobre esta nota, nunca sobre el texto del medio.
 */
export interface EditorNote {
  id: string;
  storyId: string;
  outletId: string;
  columnistId?: string;
  url: string;
  kind: Article["kind"];
  claims: string;
  framing: string;
  opinions: string;
  editor: string;
  createdAt: string;
}
