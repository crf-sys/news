import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { AdminNav } from "@/components/AdminNav";
import { ingestRss } from "@/lib/pipeline/ingest";
import { outlet } from "@/lib/sources";

export default function Ingesta() {
  return (
    <main className="mx-auto max-w-6xl px-4 pt-10">
      <p className="label text-disputed">Back-office · solo editores</p>
      <h1 className="display mt-4 text-6xl sm:text-8xl">Ingesta</h1>
      <AdminNav active="/admin/ingesta" />
      <p className="mt-6 max-w-2xl text-muted">Lectura en directo de los RSS de los medios en modo automático. Solo metadatos: titular, enlace, fecha y extracto breve.</p>
      <Suspense fallback={<p className="label mt-10 text-muted">Leyendo feeds…</p>}>
        <Live />
      </Suspense>
    </main>
  );
}

// Como mucho una lectura cada 6 h (≈ 4 al día), aunque la página se visite más.
async function cachedIngest() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 6 * 3600, expire: 24 * 3600 });
  return ingestRss();
}

async function Live() {
  const { articles, report } = await cachedIngest();
  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat n={articles.length} label="Piezas únicas" />
        <Stat n={articles.filter((a) => a.kind === "opinion").length} label="De opinión" />
        <Stat n={report.filter((r) => r.ok).length} label="Feeds OK" />
        <Stat n={report.filter((r) => !r.ok).length} label="Feeds con error" />
      </div>
      {report.some((r) => !r.ok) && (
        <ul className="mt-4 space-y-1 text-sm text-disputed">
          {report.filter((r) => !r.ok).map((r) => <li key={r.feed}>{r.feed}: {r.error}</li>)}
        </ul>
      )}
      <ol className="mt-8 divide-y divide-line border-y border-line">
        {articles.slice(0, 60).map((a) => (
          <li key={a.id} className="py-4">
            <a href={a.url} target="_blank" rel="noreferrer" className="group block">
              <p className="label text-[9px] text-muted">
                {outlet(a.outletId).name} · {new Date(a.publishedAt).toLocaleString("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                {a.kind === "opinion" && <span className="ml-2 text-opinion">Opinión</span>}
              </p>
              <p className="mt-1 text-lg leading-snug group-hover:text-accent">{a.title}</p>
            </a>
          </li>
        ))}
      </ol>
    </>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="numeral text-5xl">{n}</div>
      <div className="label mt-2 text-[10px] text-muted">{label}</div>
    </div>
  );
}
