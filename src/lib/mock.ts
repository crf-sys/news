import type { DailyEdition, Story } from "./types";

// DATOS DE EJEMPLO para diseñar la interfaz. Temas genéricos y ficticios:
// no representan noticias reales ni posiciones reales de ningún medio.

const ALL = ["elpais", "elmundo", "abc", "lavanguardia", "elconfidencial", "eldiario", "larazon", "elespanol", "20minutos", "rtve"];
const cov = (ids: string[]) => ids.map((outletId, i) => ({ outletId, frontPageRank: (i % 4) + 1 }));

const lead: Story = {
  id: "presupuestos-2027",
  rank: 1,
  section: "politica",
  headline: "El Gobierno presenta el proyecto de Presupuestos para 2027 sin apoyos asegurados",
  dek: "El texto llega al Congreso con una previsión de déficit del 2,5 % y la votación de enmiendas a la totalidad prevista para noviembre.",
  coverage: cov(ALL),
  claims: [
    { text: "El proyecto se registró ayer en el Congreso.", status: "hecho", outletIds: ALL },
    { text: "Prevé un déficit público del 2,5 % del PIB.", status: "hecho", outletIds: ["elpais", "elmundo", "elconfidencial", "lavanguardia", "rtve"] },
    { text: "El Gobierno no tiene garantizada la mayoría para aprobarlo.", status: "hecho", outletIds: ["elmundo", "abc", "eldiario", "larazon", "elespanol"] },
    { text: "Las previsiones de ingresos son demasiado optimistas.", status: "disputado", outletIds: ["elmundo", "abc", "elconfidencial"] },
    { text: "Son las cuentas más sociales de la legislatura.", status: "opinion", outletIds: ["eldiario"] },
    { text: "Son unos presupuestos electoralistas.", status: "opinion", outletIds: ["abc", "larazon"] },
  ],
  framings: [
    { lean: "izquierda", summary: "Pone el foco en el aumento del gasto en vivienda y dependencia y en la presión a los socios para no bloquearlos.", outletIds: ["eldiario", "elpais"] },
    { lean: "centro", summary: "Se centra en las cifras, el calendario parlamentario y la aritmética de votos.", outletIds: ["lavanguardia", "20minutos", "rtve"] },
    { lean: "derecha", summary: "Destaca el riesgo fiscal, la dependencia de socios minoritarios y la posibilidad de prórroga.", outletIds: ["abc", "larazon", "elmundo"] },
  ],
  opinions: [
    { columnistId: "col-2", take: "Defiende que las cuentas consolidan el gasto social.", url: "#" },
    { columnistId: "col-4", take: "Sostiene que el cuadro macro no es creíble.", url: "#" },
    { columnistId: "col-5", take: "Cree que el resultado dependerá de concesiones territoriales.", url: "#" },
    { columnistId: "col-1", take: "Pide a los socios que separen las cuentas de otras negociaciones.", url: "#" },
    { columnistId: "col-6", take: "Advierte del coste de una nueva prórroga presupuestaria.", url: "#" },
    { columnistId: "voz-11", take: "Ve en las cuentas un mensaje para el electorado joven.", url: "#" },
    { columnistId: "voz-12", take: "Señala que el cuadro macro es plausible pero con riesgos a la baja.", url: "#" },
  ],
  context: [
    "Si no se aprueban, se prorrogan automáticamente los presupuestos vigentes.",
    "Las enmiendas a la totalidad requieren mayoría simple para devolver el texto al Gobierno.",
  ],
  openQuestions: [
    "¿Qué grupos han anunciado enmienda a la totalidad?",
    "¿Qué dirá la AIReF sobre las previsiones de ingresos?",
  ],
  articles: [],
};

const simple = (
  id: string,
  rank: number,
  section: Story["section"],
  headline: string,
  dek: string,
  ids: string[],
): Story => ({
  id, rank, section, headline, dek,
  coverage: cov(ids),
  claims: [{ text: dek, status: "hecho", outletIds: ids }],
  framings: [], opinions: [], context: [], openQuestions: [], articles: [],
});

export const TODAY: DailyEdition = {
  date: "2026-10-14",
  generatedAt: "2026-10-14T06:30:00+02:00",
  stories: [
    lead,
    simple("alquiler-ley", 2, "economia", "El precio del alquiler sube un 9 % interanual según el último índice oficial", "Las mayores subidas se concentran en las capitales con zonas tensionadas declaradas.", ALL.slice(0, 9)),
    simple("cumbre-ue-defensa", 3, "internacional", "Los líderes europeos debaten un fondo común de defensa", "La propuesta divide a los Estados miembros sobre la emisión de deuda conjunta.", ALL.slice(0, 8)),
    simple("tribunal-supremo", 4, "tribunales", "El Supremo fija doctrina sobre la aplicación de una reforma penal", "La sentencia afecta a varios centenares de causas en revisión.", ["elpais", "elmundo", "abc", "eldiario", "larazon", "elespanol", "elconfidencial"]),
    simple("huelga-transporte", 5, "sociedad", "Convocada una huelga en el transporte ferroviario para la próxima semana", "Sindicatos y empresa mantienen abierta la negociación sobre servicios mínimos.", ["20minutos", "rtve", "lavanguardia", "elpais", "elmundo", "eldiario"]),
    simple("paro-septiembre", 6, "economia", "El paro registrado sube en septiembre por el fin de la temporada turística", "La afiliación a la Seguridad Social se mantiene por encima de los 21 millones.", ["elpais", "elmundo", "elconfidencial", "20minutos", "rtve", "lavanguardia"]),
    simple("financiacion-autonomica", 7, "politica", "Nueva reunión del Consejo de Política Fiscal y Financiera", "Las comunidades llegan con posiciones enfrentadas sobre el modelo de financiación.", ["lavanguardia", "abc", "elmundo", "elpais", "larazon"]),
    simple("elecciones-eeuu", 8, "internacional", "Estados Unidos encara la recta final de las elecciones de mitad de mandato", "Las encuestas apuntan a un resultado ajustado en la Cámara de Representantes.", ["elpais", "elmundo", "abc", "rtve", "elconfidencial"]),
    simple("sanidad-listas", 9, "sociedad", "Las listas de espera quirúrgicas alcanzan un nuevo máximo", "El Ministerio y las comunidades discrepan sobre la metodología de cómputo.", ["eldiario", "20minutos", "elpais", "abc"]),
    simple("energia-precio", 10, "economia", "El precio de la luz baja en octubre por el aumento de la eólica", "El mercado mayorista marca mínimos desde la primavera.", ["elconfidencial", "elespanol", "20minutos", "lavanguardia"]),
  ],
};

export const story = (id: string) => TODAY.stories.find((s) => s.id === id);
