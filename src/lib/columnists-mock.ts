import type { ColumnistProfile } from "./types";
import { COLUMNISTS } from "./sources";

// DATOS DE EJEMPLO. En producción cada valor sale del pipeline (etapa "profile"), no de aquí.

const base = (columnistId: string, seed: number): ColumnistProfile => {
  const v = (k: number) => Math.max(-1, Math.min(1, Math.sin(seed * 1.7 + k) * 0.9));
  return {
    columnistId,
    bio: "Columnista de opinión política. Ficha generada automáticamente a partir de sus textos publicados.",
    since: "2019",
    frequency: "2 columnas / semana",
    articlesAnalyzed: 80 + seed * 13,
    axes: [
      { id: "economico", label: "Económico", poles: ["Más Estado", "Más mercado"], value: v(1), confidence: 0.82, evidence: 41, examples: [] },
      { id: "social", label: "Social", poles: ["Progresista", "Conservador"], value: v(2), confidence: 0.74, evidence: 33, examples: [] },
      { id: "territorial", label: "Territorial", poles: ["Descentralización", "Centralización"], value: v(3), confidence: 0.68, evidence: 27, examples: [] },
      { id: "europa", label: "Europa", poles: ["Más integración", "Más soberanía"], value: v(4) * 0.6, confidence: 0.45, evidence: 9, examples: [] },
      { id: "institucional", label: "Institucional", poles: ["Reformista", "Conservación"], value: v(5), confidence: 0.6, evidence: 18, examples: [] },
    ],
    topics: [
      { topic: "Gobierno y Congreso", share: 0.34 },
      { topic: "Economía", share: 0.21 },
      { topic: "Modelo territorial", share: 0.17 },
      { topic: "Justicia", share: 0.12 },
      { topic: "Internacional", share: 0.09 },
    ],
    stance: [
      { actor: "Gobierno", tone: v(6), mentions: 58 },
      { actor: "Principal partido de la oposición", tone: v(7), mentions: 41 },
      { actor: "Socios parlamentarios", tone: v(8), mentions: 22 },
      { actor: "Poder judicial", tone: v(9) * 0.5, mentions: 15 },
    ],
    featured: [
      { title: "Columna de ejemplo sobre los Presupuestos", url: "#", date: "2026-10-13", why: "La más compartida de la semana", reach: "Alta" },
      { title: "Columna de ejemplo sobre financiación autonómica", url: "#", date: "2026-10-07", why: "Citada por otros 3 columnistas del panel" },
      { title: "Columna de ejemplo sobre la cumbre europea", url: "#", date: "2026-09-29", why: "Rompe con su posición habitual en el eje Europa" },
      { title: "Columna de ejemplo sobre vivienda", url: "#", date: "2026-09-18", why: "Tema más recurrente del mes" },
    ],
  };
};

export const PROFILES: ColumnistProfile[] = COLUMNISTS.map((c, i) => {
  const p = base(c.id, i + 1);
  p.axes[0].examples = [
    { quote: "Frase breve de ejemplo que justifica la posición en este eje.", url: "#", date: "2026-10-02" },
    { quote: "Otra frase de ejemplo, enlazada a su columna original.", url: "#", date: "2026-09-12" },
  ];
  return p;
});

export const profile = (id: string) => PROFILES.find((p) => p.columnistId === id);
