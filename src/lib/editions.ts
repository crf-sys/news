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
  return {
    region: row.region,
    date: new Date(row.day).toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" }),
    generatedAt: new Date(row.generated_at).toISOString(),
    model: row.model,
    stories: row.stories as Story[],
  };
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
