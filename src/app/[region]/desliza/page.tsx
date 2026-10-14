import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Desliza } from "@/components/Desliza";
import { ACTIVE_REGIONS } from "@/lib/regions";

export function generateStaticParams() {
  return ACTIVE_REGIONS.filter((r) => r.id !== "es").map((r) => ({ region: r.id }));
}

export default async function DeslizaRegion({ params }: PageProps<"/[region]/desliza">) {
  const { region } = await params;
  if (!ACTIVE_REGIONS.some((r) => r.id === region && r.id !== "es")) notFound();
  return <Suspense fallback={<p className="p-10 text-muted">Cargando…</p>}><Desliza region={region} /></Suspense>;
}
