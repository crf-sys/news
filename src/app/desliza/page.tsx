import { Suspense } from "react";
import { Desliza } from "@/components/Desliza";

export const metadata = { title: "Las 10 de hoy en 3 minutos · Ágora" };

export default function DeslizaNacional() {
  return <Suspense fallback={<p className="p-10 text-muted">Cargando…</p>}><Desliza region="es" /></Suspense>;
}
