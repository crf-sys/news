import type { ColumnistProfile } from "./types";

// Fichas ideológicas MEDIDAS. Se rellenan desde el pipeline de perfiles (pipeline/profile.ts) a partir
// de los textos de cada voz. Nunca se escriben a mano ni con datos de ejemplo: una voz sin ficha
// medida se muestra como "en calibración".
export const PROFILES: ColumnistProfile[] = [];

export const profile = (id: string) => PROFILES.find((p) => p.columnistId === id);
