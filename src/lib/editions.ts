import { cacheLife } from "next/cache";
import { sql } from "./db";
import type { DailyEdition, Story } from "./types";

export type Edition = DailyEdition & { model: string; region: string };

/** Última edición publicada de un ámbito, o null si aún no hay ninguna. Cacheada 5 min. */
export async function latestEdition(region = "es"): Promise<Edition | null> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  const [row] = await sql`select region, day, generated_at, model, stories from editions where region = ${region} order by day desc limit 1`;
  if (!row) return null;
  const date = new Date(row.day).toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
  const stories = await withFrontPageReviews(row.stories as Story[], date);
  return { region: row.region, date, generatedAt: new Date(row.generated_at).toISOString(), model: row.model, stories };
}

/**
 * Suma a cada tema los medios cuya portada ha revisado un editor (lectura asistida) y reordena por
 * cobertura. El denominador pasa a ser: medios leídos automáticamente + portadas revisadas hoy.
 */
async function withFrontPageReviews(stories: Story[], day: string): Promise<Story[]> {
  const [reviews, marks] = await Promise.all([
    sql`select outlet_id from front_page_reviews where day = ${day}`,
    sql`select outlet_id, topic_id, position from front_page_marks where day = ${day} and position is not null`,
  ]);
  if (!reviews.length) return stories;
  const merged = stories.map((s) => {
    const extra = marks.filter((m) => m.topic_id === s.id && !s.coverage.some((c) => c.outletId === m.outlet_id));
    const coverage = [...s.coverage, ...extra.map((m) => ({ outletId: m.outlet_id as string, frontPageRank: m.position as number }))];
    const objectivity = s.objectivity && {
      ...s.objectivity,
      outlets: coverage.length,
      outletsTotal: (s.objectivity.outletsTotal ?? s.objectivity.outlets) + reviews.length,
    };
    return { ...s, coverage, objectivity };
  });
  const best = (s: Story) => Math.min(99, ...s.coverage.map((c) => c.frontPageRank ?? 99));
  return merged
    .sort((a, b) => b.coverage.length - a.coverage.length || best(a) - best(b) || a.rank - b.rank)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

/** Busca un tema en la última edición de cualquier ámbito (primero la nacional). */
export async function findStory(id: string, regions: readonly string[]): Promise<{ story: Story; edition: Edition } | null> {
  for (const r of regions) {
    const ed = await latestEdition(r);
    const story = ed?.stories.find((s) => s.id === id);
    if (story && ed) return { story, edition: ed };
  }
  return null;
}
