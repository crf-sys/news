import type { Columnist, Lean, Outlet, VoiceKind } from "./types";

// Panel inicial de 10 medios. La posición ideológica es PROVISIONAL: hay que calibrarla
// con fuentes externas (autoubicación de audiencias del Reuters Digital News Report,
// estudios académicos) y con el propio análisis de framing acumulado. Nunca a ojo.
// `access` y `legal` salen de la revisión de condiciones del 14/10/2026 (docs/FUENTES-LEGAL.md).
// Los RSS listados están comprobados (responden 200 con <item>); no añadir feeds sin verificarlos.
const PROVISIONAL = "Provisional — pendiente de calibrar (ver /metodologia)";
const TDM = "Reserva expresa de minería de textos e IA (art. 67.3 RDL 24/2021)";

export const OUTLETS: Outlet[] = [
  { id: "elpais", name: "El País", url: "https://elpais.com", rss: [], lean: -1, leanSource: PROVISIONAL,
    access: "licencia", legal: { note: `${TDM}; también frente a revistas de prensa (art. 32.1 LPI).`, url: "https://elpais.com/info/aviso-legal/" } },
  { id: "elmundo", name: "El Mundo", url: "https://www.elmundo.es", rss: [], lean: 1, leanSource: PROVISIONAL,
    access: "licencia", legal: { note: `${TDM}, incluida extracción automatizada.`, url: "https://www.elmundo.es/registro/avisolegal.html" } },
  { id: "abc", name: "ABC", url: "https://www.abc.es", rss: [], lean: 2, leanSource: PROVISIONAL,
    access: "licencia", legal: { note: `${TDM} y art. 4.3 Directiva (UE) 2019/790.`, url: "https://www.abc.es/contacto/condiciones.html" } },
  { id: "lavanguardia", name: "La Vanguardia", url: "https://www.lavanguardia.com", rss: [], lean: 0, leanSource: PROVISIONAL,
    access: "licencia", legal: { note: `${TDM}. robots.txt bloquea /premium/. Contacto: digital@lavanguardia.es`, url: "https://www.lavanguardia.com/avisolegal.html" } },
  { id: "elconfidencial", name: "El Confidencial", url: "https://www.elconfidencial.com", rss: [], lean: 1, leanSource: PROVISIONAL,
    access: "licencia", legal: { note: "robots.txt bloquea todos los bots de IA; la reutilización requiere licencia.", url: "https://www.elconfidencial.com/politicas-de-privacidad/condiciones/" } },
  { id: "eldiario", name: "elDiario.es", url: "https://www.eldiario.es", lean: -2, leanSource: PROVISIONAL,
    rss: ["https://www.eldiario.es/rss/", "https://www.eldiario.es/rss/politica/", "https://www.eldiario.es/rss/economia/", "https://www.eldiario.es/rss/internacional/", "https://www.eldiario.es/rss/opinion/"],
    access: "auto", legal: { note: "Sin reserva expresa de minería de textos detectada.", url: "https://www.eldiario.es/aviso_legal/" } },
  { id: "larazon", name: "La Razón", url: "https://www.larazon.es", rss: [], lean: 2, leanSource: PROVISIONAL,
    access: "licencia", legal: { note: "robots.txt bloquea los principales bots de IA.", url: "https://www.larazon.es/aviso-legal/" } },
  { id: "elespanol", name: "El Español", url: "https://www.elespanol.com", lean: 1, leanSource: PROVISIONAL,
    rss: ["https://www.elespanol.com/rss/", "https://www.elespanol.com/rss/espana/", "https://www.elespanol.com/rss/mundo/", "https://www.elespanol.com/rss/opinion/"],
    access: "auto", legal: { note: "Sin reserva de minería detectada; prohíbe reproducir contenidos con fines comerciales (solo usamos metadatos + enlace).", url: "https://www.elespanol.com/aviso_legal/" } },
  { id: "20minutos", name: "20minutos", url: "https://www.20minutos.es", rss: [], lean: 0, leanSource: PROVISIONAL,
    access: "licencia", legal: { note: `${TDM}, incluido web scraping y crawling.`, url: "https://www.20minutos.es/documento/legal/" } },
  { id: "rtve", name: "RTVE", url: "https://www.rtve.es", lean: 0, leanSource: PROVISIONAL,
    rss: ["https://www.rtve.es/rss/temas_noticias.xml", "https://www.rtve.es/rss/temas_espana.xml", "https://www.rtve.es/rss/temas_economia.xml"],
    access: "auto", legal: { note: "Sin reserva expresa de minería de textos detectada.", url: "https://www.rtve.es/comunes/aviso_legal.html" } },
];

// Los 10 columnistas son una decisión editorial: se dejan como huecos a propósito.
// Criterio sugerido: alcance + diversidad ideológica + al menos uno por medio grande.
export const COLUMNISTS: Columnist[] = [
  { id: "col-1", name: "Columnista 1", kind: "columnista", outletId: "elpais", lean: -1 },
  { id: "col-2", name: "Columnista 2", kind: "columnista", outletId: "eldiario", lean: -2 },
  { id: "col-3", name: "Columnista 3", kind: "columnista", outletId: "elmundo", lean: 1 },
  { id: "col-4", name: "Columnista 4", kind: "columnista", outletId: "abc", lean: 2 },
  { id: "col-5", name: "Columnista 5", kind: "columnista", outletId: "lavanguardia", lean: 0 },
  { id: "col-6", name: "Columnista 6", kind: "columnista", outletId: "elconfidencial", lean: 1 },
  { id: "col-7", name: "Columnista 7", kind: "columnista", outletId: "larazon", lean: 2 },
  { id: "col-8", name: "Columnista 8", kind: "columnista", outletId: "elespanol", lean: 1 },
  { id: "col-9", name: "Columnista 9", kind: "columnista", outletId: "elpais", lean: -1 },
  { id: "col-10", name: "Columnista 10", kind: "columnista", outletId: "20minutos", lean: 0 },
  // Otras voces (no columnistas de un medio del panel)
  { id: "voz-11", name: "Líder de opinión 1", kind: "lider_opinion", outletId: "independiente", lean: -1, inclusionReason: "Newsletter política con gran alcance" },
  { id: "voz-12", name: "Académica 1", kind: "academico", outletId: "independiente", lean: 0, inclusionReason: "Catedrática de Hacienda Pública, referente en financiación" },
];

export const outlet = (id: string) => OUTLETS.find((o) => o.id === id)!;
export const columnist = (id: string) => COLUMNISTS.find((c) => c.id === id)!;

export const LEAN_LABEL: Record<Lean, string> = {
  [-2]: "Izquierda",
  [-1]: "Centro-izq.",
  0: "Centro",
  1: "Centro-der.",
  2: "Derecha",
};

export const VOICE_KIND_LABEL: Record<VoiceKind, string> = {
  columnista: "Columnista",
  lider_opinion: "Líder de opinión",
  periodista: "Periodista",
  academico: "Académico/a",
  think_tank: "Think tank",
};

/** "El País" o "Independiente". */
export const affiliation = (c: Columnist) => (c.outletId === "independiente" ? "Independiente" : outlet(c.outletId).name);

export const ACCESS_LABEL: Record<Outlet["access"], string> = {
  auto: "Automático",
  licencia: "Lectura humana · licencia pendiente",
  licenciado: "Licenciado",
};
