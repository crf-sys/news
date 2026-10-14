import { Suspense } from "react";
import { EditionView } from "@/components/EditionView";

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <EditionView region="es" mode="portada" />
    </Suspense>
  );
}

function Loading() {
  return <p className="label mx-auto max-w-6xl px-4 pt-16 text-muted">Cargando la edición…</p>;
}
