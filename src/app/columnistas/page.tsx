import Link from "next/link";
import { COLUMNISTS, outlet, affiliation } from "@/lib/sources";
import { profile } from "@/lib/columnists-mock";

export default function Columnistas() {
  return (
    <main className="grain mx-auto max-w-6xl px-4 pt-10 sm:pt-16">
      <p className="label text-accent">El panel de opinión</p>
      <h1 className="display mt-4 text-7xl sm:text-9xl">Columnistas</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">10 voces seleccionadas por alcance y diversidad. Cada ficha se calcula a partir de lo que escriben, con las pruebas a la vista.</p>
      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        {COLUMNISTS.map((c, i) => {
          const p = profile(c.id)!;
          return (
            <Link key={c.id} href={`/columnista/${c.id}`} className="group flex items-center gap-5 rounded-3xl border border-line bg-surface p-5 hover:border-accent">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-line display text-3xl group-hover:bg-accent group-hover:text-bg">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="display text-3xl">{c.name}</p>
                <p className="label mt-1 text-[10px] text-muted">{affiliation(c)} · {p.articlesAnalyzed} textos analizados</p>
                <div className="mt-3 flex gap-1">
                  {p.axes.map((a) => (
                    <div key={a.id} title={a.label} className="relative h-1.5 flex-1 rounded-full bg-line">
                      <span className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" style={{ left: `${((a.value + 1) / 2) * 100}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
