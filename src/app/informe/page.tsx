import { Suspense } from "react";
import { EditionView } from "@/components/EditionView";

export default function InformeNacional() {
  return (
    <Suspense fallback={<p className="label mx-auto max-w-6xl px-4 pt-16 text-muted">Cargando el informe…</p>}>
      <EditionView region="es" mode="informe" />
    </Suspense>
  );
}
