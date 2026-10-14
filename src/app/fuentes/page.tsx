import { OUTLETS, LEAN_LABEL, ACCESS_LABEL } from "@/lib/sources";
import type { Lean } from "@/lib/types";

export default function Fuentes() {
  const cols: Lean[] = [-2, -1, 0, 1, 2];
  return (
    <main className="grain mx-auto max-w-6xl px-4 pt-10 sm:pt-16">
      <p className="label text-accent">El panel de medios</p>
      <h1 className="display mt-4 text-7xl sm:text-9xl">Fuentes</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">Los 10 medios que leemos cada mañana y dónde se sitúa su línea editorial. Posiciones provisionales hasta calibrarlas.</p>

      {/* Mapa: en móvil es una lista por bloques; en escritorio, 5 columnas */}
      <div className="mt-12 grid gap-3 sm:grid-cols-5">
        {cols.map((lean) => (
          <div key={lean} className="rounded-3xl border border-line bg-surface p-5">
            <p className="label text-muted">{LEAN_LABEL[lean]}</p>
            <ul className="mt-4 space-y-2">
              {OUTLETS.filter((o) => o.lean === lean).map((o) => (
                <li key={o.id} className="display text-3xl">{o.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-3 h-2 rounded-full bg-gradient-to-r from-fg/10 via-fg/60 to-fg/10" />

      <section className="mt-20">
        <p className="label text-muted">Transparencia</p>
        <h2 className="display mt-2 text-5xl sm:text-7xl">Cómo leemos a cada medio</h2>
        <p className="mt-3 max-w-2xl text-muted">Respetamos lo que cada medio dice en sus condiciones. Si se reserva el análisis automático, solo lo lee una persona hasta tener licencia.</p>
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {OUTLETS.map((o) => (
            <li key={o.id} className="grid gap-2 py-5 sm:grid-cols-[12rem_14rem_1fr]">
              <span className="display text-2xl">{o.name}</span>
              <span className={`label self-center text-[10px] ${o.access === "licencia" ? "text-disputed" : "text-accent"}`}>{ACCESS_LABEL[o.access]}</span>
              <span className="text-sm text-muted">{o.legal.note} {o.legal.url && <a href={o.legal.url} className="underline" target="_blank" rel="noreferrer">Condiciones ↗</a>}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
