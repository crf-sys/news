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
  { id: "elindependiente", name: "El Independiente", url: "https://www.elindependiente.com", leanSource: "Sin calibrar",
    rss: ["https://www.elindependiente.com/feed/", "https://www.elindependiente.com/espana/feed/", "https://www.elindependiente.com/opinion/feed/"],
    access: "auto", legal: { note: "Sin reserva de minería ni bloqueo de bots de IA (revisión 14/10/2026).", url: "https://www.elindependiente.com/aviso-legal-terminos-uso/" } },
];

// Panel de voces (investigado el 14/10/2026: rankings de influencia, EGM, premios; fuentes en
// docs/VOCES.md). A propósito NO se asigna ideología: `lean` queda vacío hasta que el sistema mida
// sus textos (ver pipeline/profile.ts). Una ficha sin medir se muestra como "en calibración".
export const COLUMNISTS: Columnist[] = [
  {"id": "ignacio-camacho", "name": "Ignacio Camacho", "kind": "columnista", "outletId": "abc", "authorUrl": "https://www.abc.es/autor/ignacio-camacho-1085/", "inclusionReason": "Columnista diario de ABC con más de 10.000 artículos de opinión publicados; premios Mariano de Cavia, González-Ruano, Miguel Delibes y Julio Camba, y objeto de estudio académico (Estudios sobre el Mensaje Periodístico, 2024)."},
  {"id": "lucia-mendez", "name": "Lucía Méndez", "kind": "columnista", "outletId": "elmundo", "authorUrl": "https://www.elmundo.es/autor/lucia-mendez.html", "feedUrl": "https://www.elmundo.es/rss/googlenews/autor/lucia-mendez.xml", "inclusionReason": "Cofundadora de El Mundo (1989), exjefa de Opinión; primer Premio Josefina Carabias del Congreso de periodismo político y parlamentario y Premio Raúl del Pozo de periodismo de opinión (2022). Columnas y crónicas activas en octubre de 2026."},
  {"id": "enric-juliana", "name": "Enric Juliana", "kind": "columnista", "outletId": "lavanguardia", "authorUrl": "https://www.lavanguardia.com/autores/enric-juliana.html", "inclusionReason": "Puesto 24 en el ranking Merca2 de las 50 personas más influyentes en comunicación (enero 2026), único columnista de La Vanguardia en la lista; Premio Ciutat de Barcelona de periodismo."},
  {"id": "ignacio-escolar", "name": "Ignacio Escolar", "kind": "columnista", "outletId": "eldiario", "authorUrl": "https://www.eldiario.es/autores/ignacio_escolar/", "feedUrl": "https://www.eldiario.es/rss/category/author/520002/", "inclusionReason": "Fundador y director de elDiario.es; puesto 42 en el ranking Merca2 de las 50 personas más influyentes en comunicación (enero 2026). Feed de autor activo (último artículo 10/10/2026)."},
  {"id": "ruben-amon", "name": "Rubén Amón", "kind": "columnista", "outletId": "elconfidencial", "authorUrl": "https://www.elconfidencial.com/autores/ruben-amon-438/", "inclusionReason": "Articulista de El Confidencial desde 2019 tras su etapa en El País; tertuliano habitual y director de La Cultureta en Onda Cero. Página de autor con publicaciones de octubre de 2026."},
  {"id": "mariam-martinez-bascunan", "name": "Máriam Martínez-Bascuñán", "kind": "columnista", "outletId": "elpais", "authorUrl": "https://elpais.com/autor/mariam-martinez-bascunan/", "feedUrl": "https://elpais.com/arc/outboundfeeds/rss/author/mariam_martinez_bascunan_a/?outputType=xml", "inclusionReason": "Directora de Opinión de El País (2018-2020) y actual columnista y miembro de su comité editorial; politóloga de la UAM. Feed de autor con publicaciones del 14/10/2026."},
  {"id": "pedro-j-ramirez", "name": "Pedro J. Ramírez", "kind": "columnista", "outletId": "elespanol", "authorUrl": "https://www.elespanol.com/autor/pedro_j-_ramirez/", "feedUrl": "https://www.elespanol.com/rss/autor/pedro_j-_ramirez/", "inclusionReason": "Fundador y director de El Español (y antes de El Mundo); puesto 21 en el ranking Merca2 (enero 2026). Publica la Carta del Director cada domingo (última: 11/10/2026)."},
  {"id": "francisco-marhuenda", "name": "Francisco Marhuenda", "kind": "columnista", "outletId": "larazon", "authorUrl": "https://www.larazon.es/autores/fmarhuenda/", "inclusionReason": "Director de La Razón; puesto 19 en el ranking Merca2 de las 50 personas más influyentes en comunicación (enero 2026); tertuliano habitual en radio y televisión."},
  {"id": "jesus-marana", "name": "Jesús Maraña", "kind": "columnista", "outletId": "independiente", "outletName": "infoLibre", "authorUrl": "https://www.infolibre.es/autores/jesus-marana/", "feedUrl": "https://www.infolibre.es/rss/category/author/500001/", "inclusionReason": "Cofundador de infoLibre y tintaLibre (2013), exdirector de Público, Interviú y Tiempo; analista en tertulias de televisión. Columnas 'Buzón de Voz' activas (5/10/2026)."},
  {"id": "casimiro-garcia-abadillo", "name": "Casimiro García-Abadillo", "kind": "columnista", "outletId": "independiente", "outletName": "El Independiente", "authorUrl": "https://www.elindependiente.com/autor/casimiro-garcia-abadillo/", "feedUrl": "https://www.elindependiente.com/autor/casimiro-garcia-abadillo/feed/", "inclusionReason": "Fundador y director de El Independiente, exdirector de El Mundo (2014-2015); puesto 50 en el ranking Merca2 (enero 2026); tertuliano en Onda Cero y Antena 3. Último artículo en feed: 12/10/2026."},
  {"id": "carlos-herrera", "name": "Carlos Herrera", "kind": "periodista", "outletId": "independiente", "outletName": "COPE", "authorUrl": "https://www.cope.es/autores/carlos-herrera", "inclusionReason": "Número 1 del ranking Merca2 de las 50 personas más influyentes en comunicación (enero 2026); récord histórico de 3.093.000 oyentes en la 1ª ola del EGM 2026."},
  {"id": "carlos-alsina", "name": "Carlos Alsina", "kind": "periodista", "outletId": "independiente", "outletName": "Onda Cero", "inclusionReason": "Puesto 4 en el ranking Merca2 (enero 2026) y Premio Francisco Cerecedo 2023; 'Más de uno' batió su récord con más de 1,8 millones de oyentes (1ª ola EGM 2026). Desde la temporada 2026-27 conduce la franja de 10:00 a 12:30."},
  {"id": "aimar-bretos", "name": "Aimar Bretos", "kind": "periodista", "outletId": "independiente", "outletName": "Cadena SER", "inclusionReason": "Sustituye a Àngels Barceló al frente de 'Hoy por Hoy', el programa de radio más escuchado de España (3.095.000 oyentes diarios en la 2ª ola EGM 2026); antes dirigió 'Hora 25'."},
  {"id": "federico-jimenez-losantos", "name": "Federico Jiménez Losantos", "kind": "lider_opinion", "outletId": "independiente", "outletName": "esRadio / Libertad Digital", "authorUrl": "https://www.libertaddigital.com/opinion/federico-jimenez-losantos/", "feedUrl": "https://www.libertaddigital.com/autores/federico-jimenez-losantos/rss.xml", "inclusionReason": "Puesto 18 en el ranking Merca2 (enero 2026); fundador de esRadio y Libertad Digital, con programa matinal diario y columna activa (feed de autor actualizado el 11/10/2026)."},
  {"id": "antonio-garcia-ferreras", "name": "Antonio García Ferreras", "kind": "periodista", "outletId": "independiente", "outletName": "laSexta", "inclusionReason": "Puesto 13 en el ranking Merca2 (enero 2026); dirige desde 2011 el principal programa diario de debate político de laSexta (alrededor de 300.000 espectadores según El Debate, sept. 2025)."},
  {"id": "pablo-simon", "name": "Pablo Simón", "kind": "academico", "outletId": "independiente", "authorUrl": "https://elpais.com/autor/pablo-simon-cosano/", "feedUrl": "https://elpais.com/arc/outboundfeeds/rss/author/pablo_simon_cosano_a/?outputType=xml", "inclusionReason": "Politólogo de la UC3M, editor de Politikon y analista habitual en laSexta, TVE y Cadena SER; descrito como uno de los comentaristas políticos más solicitados por radio y TV. Su feed en El País es irregular (última pieza 23/03/2026)."},
];

// ── Medios autonómicos (revisión del 14/10/2026, ver docs/FUENTES-LEGAL.md) ──
// Solo se listan los que permiten la lectura automática, más las secciones regionales de los nacionales
// que también la permiten. La línea editorial de los autonómicos queda "sin calibrar" hasta medirla.
const REGIONAL = "Sin reserva expresa de minería de textos ni bloqueo de bots de IA (revisión 14/10/2026).";
const sectionOf = (base: string, region: string, suffix: string, rss: string[]): Outlet => {
  const o = OUTLETS.find((x) => x.id === base)!;
  return { ...o, id: `${base}-${region}`, name: `${o.name} ${suffix}`, rss, region };
};

export const REGIONAL_OUTLETS: Outlet[] = [
  // Andalucía: sus 5 grandes medios se reservan la minería de textos; se cubre con secciones regionales.
  sectionOf("rtve", "andalucia", "Andalucía", ["https://www.rtve.es/rss/temas_andalucia.xml"]),
  sectionOf("eldiario", "andalucia", "Andalucía", ["https://www.eldiario.es/rss/andalucia/"]),
  // Cataluña
  { id: "elnacional", name: "El Nacional", url: "https://www.elnacional.cat", rss: ["https://www.elnacional.cat/uploads/feeds/feed_ca.xml"], region: "cataluna", leanSource: "Sin calibrar", access: "auto", legal: { note: REGIONAL, url: "https://www.elnacional.cat/ca/termes-i-condicions-d-us.html" } },
  { id: "naciodigital", name: "Nació Digital", url: "https://naciodigital.cat", rss: ["https://naciodigital.cat/rss/"], region: "cataluna", leanSource: "Sin calibrar", access: "auto", legal: { note: REGIONAL, url: "https://naciodigital.cat/avis-legal/" } },
  sectionOf("rtve", "cataluna", "Cataluña", ["https://www.rtve.es/rss/temas_cataluna.xml"]),
  sectionOf("eldiario", "cataluna", "Catalunya", ["https://www.eldiario.es/rss/catalunya/"]),
  // Madrid
  { id: "telemadrid", name: "Telemadrid", url: "https://www.telemadrid.es", rss: ["https://www.telemadrid.es/rss/latest/"], region: "madrid", leanSource: "Sin calibrar", access: "auto", legal: { note: REGIONAL, url: "https://www.telemadrid.es/aviso-legal/" } },
  { id: "noticiasparamunicipios", name: "Noticias para Municipios", url: "https://noticiasparamunicipios.com", rss: ["https://noticiasparamunicipios.com/feed/"], region: "madrid", leanSource: "Sin calibrar", access: "auto", legal: { note: `${REGIONAL} Sus condiciones responsabilizan al usuario de daños por robots: pendiente de revisión legal.`, url: "https://noticiasparamunicipios.com/aviso-legal/" } },
  sectionOf("rtve", "madrid", "Madrid", ["https://www.rtve.es/rss/temas_comunidad-madrid.xml"]),
  sectionOf("eldiario", "madrid", "Madrid", ["https://www.eldiario.es/rss/madrid/", "https://www.eldiario.es/rss/madrid/somos/"]),
  // País Vasco
  { id: "naiz", name: "Naiz", url: "https://www.naiz.eus", rss: ["https://www.naiz.eus/es/rss/news.rss"], region: "paisvasco", leanSource: "Sin calibrar", access: "auto", legal: { note: REGIONAL, url: "https://www.naiz.eus/es/aviso-legal" } },
  { id: "eitb", name: "EITB", url: "https://www.eitb.eus/es/", rss: ["https://www.eitb.eus/es/rss/noticias/", "https://www.eitb.eus/es/rss/noticias/politica/"], region: "paisvasco", leanSource: "Sin calibrar", access: "auto", legal: { note: REGIONAL, url: "https://www.eitb.eus/es/aviso-legal/" } },
  sectionOf("rtve", "paisvasco", "País Vasco", ["https://www.rtve.es/rss/temas_pais-vasco.xml"]),
  sectionOf("eldiario", "paisvasco", "Euskadi", ["https://www.eldiario.es/rss/euskadi/"]),
];

/** Todos los medios: nacionales + autonómicos. */
export const ALL_OUTLETS: Outlet[] = [...OUTLETS, ...REGIONAL_OUTLETS];

export const outlet = (id: string) => ALL_OUTLETS.find((o) => o.id === id)!;
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
export const affiliation = (c: Columnist) => (c.outletId === "independiente" ? (c.outletName ?? "Independiente") : outlet(c.outletId).name);

export const ACCESS_LABEL: Record<Outlet["access"], string> = {
  auto: "Automático",
  licencia: "Lectura humana · licencia pendiente",
  licenciado: "Licenciado",
};
