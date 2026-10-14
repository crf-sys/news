import { Suspense } from "react";
import { notFound } from "next/navigation";
import { EditionView } from "@/components/EditionView";
import { ACTIVE_REGIONS } from "@/lib/regions";

export function generateStaticParams() {
  return ACTIVE_REGIONS.filter((r) => r.id !== "es").map((r) => ({ region: r.id }));
}

export default async function RegionInforme({ params }: PageProps<"/[region]/informe">) {
  const { region } = await params;
  if (!ACTIVE_REGIONS.some((r) => r.id === region && r.id !== "es")) notFound();
  return (
    <Suspense fallback={<p className="label mx-auto max-w-6xl px-4 pt-16 text-muted">Cargando el informe…</p>}>
      <EditionView region={region} mode="informe" />
    </Suspense>
  );
}
