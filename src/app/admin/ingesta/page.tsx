import { Suspense } from "react";
import { AdminNav } from "@/components/AdminNav";
import { ingestStats, latestArticles } from "@/lib/db";
import { outlet } from "@/lib/sources";

const madrid = (d: string) =>
  new Date(d).toLocaleString("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });

export default function Ingesta() {
  return (
    <main className="mx-auto max-w-6xl px-4 pt-10">
      <p className="label text-disputed">Back-office · solo editores</p>
      <h1 className="display mt-4 text-6xl sm:text-8xl">Ingesta</h1>
      <AdminNav active="/admin/ingesta" />
      <p className="mt-6 max-w-2xl text-muted">
        Piezas guardadas desde los RSS de los medios en modo automático (05:00, 11:00 y 17:00 UTC). Solo metadatos: titular, enlace, fecha y extracto breve.
      </p>
      <Suspense fallback={<p className="label mt-10 text-muted">Cargando…</p>}>
        <Stored />
      </Suspense>
    </main>
  );
}

async function Stored() {
  const [stats, articles] = await Promise.all([ingestStats(), latestArticles(60)]);
  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat n={stats.total} label="Piezas en BD" />
        <Stat n={stats.last24h} label="Últimas 24 h" />
        <Stat n={stats.opinion} label="De opinión" />
        <Stat n={stats.lastRun?.change.nuevas ?? 0} label="Nuevas en la última ingesta" />
      </div>
      <p className="label mt-3 text-[10px] text-muted">
        {stats.lastRun ? `Última ingesta: ${madrid(stats.lastRun.at)} · ${stats.lastRun.change.feeds} feeds · ${stats.lastRun.change.errores} con error` : "Aún no se ha ejecutado ninguna ingesta"}
      </p>
      <ol className="mt-8 divide-y divide-line border-y border-line">
        {articles.map((a) => (
          <li key={a.id} className="py-4">
            <a href={a.url} target="_blank" rel="noreferrer" className="group block">
              <p className="label text-[9px] text-muted">
                {outlet(a.outlet_id)?.name ?? a.outlet_id} · {madrid(a.published_at)}
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
