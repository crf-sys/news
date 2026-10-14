import type { Article, ColumnistProfile } from "../types";

// ETAPA 5 — Ficha de columnista (semanal, sobre TODO su histórico disponible).
// Para cada artículo de opinión, un LLM con salida estructurada extrae:
//   - posición en cada eje (-1…+1) SOLO si el texto toma postura explícita; si no, null,
//   - la frase literal (≤ 1 oración) que lo justifica, para mostrarla como evidencia,
//   - actores mencionados y tono hacia cada uno.
// Agregación: media ponderada por recencia; confianza = f(nº de textos, dispersión).
// Un eje con < 8 textos se muestra como "sin datos suficientes".
// Destacados: combinación de alcance (shares/citas por otros columnistas), novedad
// (se aparta de su posición media) y relevancia (trata uno de los temas del día).

export async function buildColumnistProfile(columnistId: string, articles: Article[]): Promise<ColumnistProfile> {
  void articles;
  throw new Error(`buildColumnistProfile no implementado (${columnistId})`);
}
