import type { Article } from "../types";

// ETAPA 2 — Agrupar en "temas": artículos de distintos medios sobre el mismo hecho.
// Enfoque: embeddings de titular+extracto → clustering por similitud (umbral ~0.8)
// en una ventana de 36 h, y un LLM que confirma/fusiona clusters dudosos.

export interface Cluster {
  id: string;
  articles: Article[];
}

export async function clusterArticles(articles: Article[]): Promise<Cluster[]> {
  // TODO: embeddings (AI Gateway) + pgvector; fusión con LLM.
  void articles;
  return [];
}
