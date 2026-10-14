import Link from "next/link";
import { spectrumOf } from "@/lib/coverage";
import type { Story } from "@/lib/types";

/**
 * El Mapa del Día: cada noticia es una burbuja. Horizontal = de qué lado del espectro la cuentan más medios;
 * tamaño = cuántos medios la cuentan. Las que salen marcadas son puntos ciegos.
 */
export function DayMap({ stories }: { stories: Story[] }) {
  const items = stories.map((s) => ({ s, sp: spectrumOf(s) }));
  const maxOutlets = Math.max(1, ...items.map((i) => i.sp.outlets));
  // Reparto vertical en carriles para que las burbujas no se pisen.
  const lanes: number[][] = [];
  const placed = items.map((it) => {
    const x = 50 + it.sp.balance * 42; // 8 % … 92 %
    let lane = 0;
    while ((lanes[lane] ?? []).some((px) => Math.abs(px - x) < 11)) lane++;
    (lanes[lane] ??= []).push(x);
    return { ...it, x, lane };
  });
  const rows = Math.max(3, lanes.length);

  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="rounded-3xl border border-line bg-surface p-5 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label text-accent">El mapa del día</p>
            <h2 className="display mt-2 text-4xl sm:text-5xl">¿Quién cuenta qué?</h2>
          </div>
          <p className="max-w-sm text-sm text-muted">Cada burbuja es una noticia. Cuanto más grande, más medios la cuentan; su posición indica de qué lado la cuentan más.</p>
        </div>

        {/* Móvil: un termómetro por noticia */}
        <ol className="mt-6 space-y-1 sm:hidden">
          {placed.map(({ s, sp, x }, i) => {
            const size = 14 + (sp.outlets / maxOutlets) * 14;
            return (
              <li key={s.id} className="rise" style={{ animationDelay: `${i * 60}ms` }}>
                <Link href={`/tema/${s.id}`} className="grid grid-cols-[1.75rem_1fr] items-center gap-3 rounded-xl px-1 py-2 active:bg-line/40">
                  <span className={`numeral text-3xl ${sp.blindSpot ? "text-disputed" : "text-accent"}`}>{s.rank}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] text-fg/90">{s.headline}</span>
                    <span className="relative mt-2 block h-7 rounded-full bg-fg/[0.06]">
                      <span className="absolute inset-y-1 left-1/2 w-px bg-line" />
                      <span className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${sp.blindSpot ? "bg-disputed" : "bg-accent"}`}
                        style={{ left: `${x}%`, width: size, height: size }} />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
          <li className="label flex justify-between pl-10 pt-1 text-[9px] text-muted"><span>← Más izquierda</span><span>Más derecha →</span></li>
        </ol>

        <div className="relative mt-8 hidden sm:block" style={{ height: rows * 64 + 24 }}>
          <div className="absolute inset-x-0 bottom-6 top-0 rounded-2xl bg-gradient-to-r from-fg/[0.04] via-fg/[0.09] to-fg/[0.04]" />
          <div className="absolute bottom-6 left-1/2 top-0 w-px bg-line" />
          {placed.map(({ s, sp, x, lane }, i) => {
            const size = 30 + (sp.outlets / maxOutlets) * 30;
            return (
              <Link key={s.id} href={`/tema/${s.id}`} title={s.headline}
                className="daymap-bubble group absolute -translate-x-1/2"
                style={{ left: `${x}%`, top: lane * 64 + (60 - size) / 2, animationDelay: `${i * 70}ms` }}>
                <span className={`numeral grid place-items-center rounded-full text-bg transition-transform group-hover:scale-110 ${sp.blindSpot ? "bg-disputed" : "bg-accent"}`}
                  style={{ width: size, height: size, fontSize: size * 0.5 }}>
                  {s.rank}
                </span>
                <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden w-56 -translate-x-1/2 rounded-xl border border-line bg-bg p-3 text-left text-xs leading-snug shadow-xl group-hover:block">
                  {s.headline}
                  <span className="label mt-2 block text-[9px] text-muted">{sp.outlets} medios{sp.blindSpot ? ` · ${sp.blindSpot.label}` : ""}</span>
                </span>
              </Link>
            );
          })}
          <div className="label absolute inset-x-0 bottom-0 flex justify-between text-[9px] text-muted">
            <span>← La cuentan más a la izquierda</span><span>Todos</span><span>Más a la derecha →</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted">
          <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-accent" />Cobertura equilibrada</span>
          <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-disputed" />Punto ciego</span>
        </div>
      </div>
    </section>
  );
}
