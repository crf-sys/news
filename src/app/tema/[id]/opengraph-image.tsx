import { findStory } from "@/lib/editions";
import { ACTIVE_REGIONS, region as regionOf } from "@/lib/regions";
import { spectrumOf } from "@/lib/coverage";
import { brandCard, OG_SIZE, storyCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Ágora · Informe objetivo";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await findStory(id, ACTIVE_REGIONS.map((r) => r.id));
  if (!found) return brandCard("Las 10 de hoy.", "Hechos separados de opinión · agora10.com");
  const { story, edition } = found;
  const sp = spectrumOf(story);
  return storyCard({
    kicker: `${edition.region === "es" ? "Nacional" : regionOf(edition.region)?.short} · nº ${story.rank}`,
    headline: story.headline,
    outlets: sp.outlets,
    total: story.objectivity?.outletsTotal,
    blocs: sp.blocs,
    blindSpot: sp.blindSpot?.label,
  });
}
