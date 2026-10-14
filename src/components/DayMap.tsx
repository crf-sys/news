import Link from "next/link";
import { spectrumOf } from "@/lib/coverage";
import { ALL_OUTLETS, outlet } from "@/lib/sources";
import type { Story } from "@/lib/types";

// Sin colores de partido: tres tonos neutros bien separados y la etiqueta escrita dentro de cada tramo.
const SIDES = [
  { key: "izquierda", label: "Izquierda", short: "Izq", cls: "bg-[#5a5a60] text-fg" },
  { key: "centro", label: "Centro", short: "Centro", cls: "bg-[#a9a7a2] text-bg" },
  { key: "derecha", label: "Derecha", short: "Der", cls: "bg-fg text-bg" },
] as const;

/**
 * ¿Quién cuenta cada noticia? Por noticia, cuántos medios de izquierda, centro y derecha la publican.
 * Sin posiciones abstractas: números que se leen de un vistazo. Los puntos ciegos se resaltan.
 */
export function DayMap({ stories }: { stories: Story[] }) {
  // Composición del panel del ámbito, para leer bien las barras (hay más medios de un lado que de otro).
  const region = outlet(stories[0]?.coverage[0]?.outletId ?? "")?.region ?? "es";
  const panel = ALL_OUTLETS.filter((o) => (o.region ?? "es") === region && o.lean !== undefined);
  const count = (f: (l: number) => boolean) => panel.filter((o) => f(o.lean!)).length;
  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="rounded-3xl border border-line bg-surface p-5 sm:p-8">
        <p className="label text-accent">Cobertura del día</p>
        <h2 className="display mt-2 text-4xl sm:text-6xl">¿Quién cuenta cada noticia?</h2>
        <p className="mt-3 max-w-xl text-muted">Cuántos medios de izquierda, centro y derecha publican cada una de las 10. Si un lado no la cuenta, lo marcamos como <b className="text-fg">punto ciego</b>.</p>

        <p className="mt-2 text-xs text-muted">Panel que leemos: {count((l) => l < 0)} de izquierda · {count((l) => l === 0)} de centro · {count((l) => l > 0)} de derecha.</p>
        <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted">
          {SIDES.map((s) => <span key={s.key} className="flex items-center gap-2"><i className={`h-3 w-5 rounded-sm ${s.cls}`} />{s.label}</span>)}
        </div>

        <ol className="mt-6 grid gap-x-10 gap-y-5 lg:grid-cols-2">
          {stories.map((s, i) => {
            const sp = spectrumOf(s);
            const total = sp.blocs.izquierda + sp.blocs.centro + sp.blocs.derecha;
            return (
              <li key={s.id} className="reveal" style={{ animationDelay: `${i * 40}ms` }}>
                <Link href={`/tema/${s.id}`} className="group grid grid-cols-[2rem_1fr] gap-3">
                  <span className={`numeral text-4xl leading-none ${sp.blindSpot ? "text-disputed" : "text-accent"}`}>{s.rank}</span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-[15px] leading-snug group-hover:text-accent">{s.headline}</span>
                    {total > 0 ? (
                      <span className="mt-2 flex h-8 overflow-hidden rounded-lg">
                        {SIDES.map(({ key, cls, short }) => {
                          const n = sp.blocs[key];
                          if (!n) return null;
                          return (
                            <span key={key} className={`flex min-w-[3.25rem] items-center justify-center gap-1 whitespace-nowrap px-1 text-[11px] font-semibold ${cls}`} style={{ width: `${(n / total) * 100}%` }}>
                              {short} <b className="text-sm">{n}</b>
                            </span>
                          );
                        })}
                      </span>
                    ) : (
                      <span className="mt-2 block text-xs text-muted">Medios aún sin calibrar</span>
                    )}
                    {sp.blindSpot && <span className="mt-1.5 block text-[11px] font-semibold text-disputed">● Punto ciego · {sp.blindSpot.label}</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
