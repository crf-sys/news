import Link from "next/link";
import { COLUMNISTS, LEAN_LABEL, OUTLETS, REGIONAL_OUTLETS } from "@/lib/sources";
import { ACTIVE_REGIONS, REGIONS } from "@/lib/regions";
import type { Lean } from "@/lib/types";

const RADIOS = ["COPE", "Cadena SER", "Onda Cero", "RNE", "esRadio", "RAC1", "Catalunya Ràdio"];

export default function Fuentes() {
  const lanes: Lean[] = [-2, -1, 0, 1, 2];
  const nacionales = OUTLETS;
  const autonomicos = REGIONAL_OUTLETS;
  const stats = [
    [String(nacionales.length + autonomicos.length), "fuentes seguidas cada día"],
    [String(ACTIVE_REGIONS.length - 1), "ediciones autonómicas"],
    [String(COLUMNISTS.length), "voces de opinión analizadas"],
    ["3", "lecturas al día"],
  ];

  return (
    <main className="grain">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:pt-16">
        <p className="label text-accent">Nuestras fuentes</p>
        <h1 className="display mt-4 max-w-5xl text-6xl sm:text-[8rem]">
          Leemos a todos. <span className="italic text-muted">Para que tú no tengas que hacerlo.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-xl text-muted">
          Cada mañana cruzamos lo que publican los grandes diarios nacionales, los medios de referencia de cada comunidad y las voces
          que marcan la conversación. Así ves qué importa de verdad, quién lo cuenta y cómo lo cuenta cada uno.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
          {stats.map(([n, l]) => (
            <div key={l} className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
              <div className="numeral text-6xl text-accent sm:text-8xl">{n}</div>
              <div className="label mt-3 text-[10px] text-muted">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MAPA NACIONAL */}
      <section className="mx-auto mt-24 max-w-6xl px-4">
        <p className="label text-muted">Prensa nacional</p>
        <h2 className="display mt-2 text-5xl sm:text-7xl">Todo el espectro, en un mapa</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Situamos la línea editorial de cada medio para que veas de un vistazo si una noticia la cuentan todos o solo un lado.
          Es una posición orientativa que calibramos de forma continua con datos públicos de audiencia y con lo que publica cada medio.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-5">
          {lanes.map((lean) => (
            <div key={lean} className="rounded-3xl border border-line bg-surface p-5">
              <p className="label text-muted">{LEAN_LABEL[lean]}</p>
              <ul className="mt-4 space-y-2">
                {nacionales.filter((o) => o.lean === lean).map((o) => (
                  <li key={o.id}><a href={o.url} target="_blank" rel="noreferrer" className="display text-3xl hover:text-accent">{o.name}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-3 h-2 rounded-full bg-gradient-to-r from-fg/10 via-fg/60 to-fg/10" />
        {nacionales.some((o) => o.lean === undefined) && (
          <p className="mt-4 text-sm text-muted">
            También seguimos: {nacionales.filter((o) => o.lean === undefined).map((o) => o.name).join(", ")}.
          </p>
        )}
      </section>

      {/* AUTONÓMICOS */}
      <section className="mx-auto mt-24 max-w-6xl px-4">
        <p className="label text-muted">Ediciones autonómicas</p>
        <h2 className="display mt-2 text-5xl sm:text-7xl">Lo que pasa en tu comunidad</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted">Las 10 noticias de cada comunidad, con sus medios de referencia y las ediciones regionales de los nacionales.</p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIVE_REGIONS.filter((r) => r.id !== "es").map((r) => (
            <Link key={r.id} href={`/${r.id}`} className="group rounded-3xl border border-line bg-surface p-6 hover:border-accent">
              <p className="display text-4xl group-hover:text-accent">{r.short}</p>
              <ul className="mt-4 space-y-1 text-muted">
                {autonomicos.filter((o) => o.region === r.id).map((o) => <li key={o.id}>{o.name}</li>)}
              </ul>
              <p className="label mt-5 text-[10px] text-accent">Ver edición →</p>
            </Link>
          ))}
        </div>
        <p className="label mt-4 text-[10px] text-muted">
          Próximamente: {REGIONS.filter((r) => !r.active).map((r) => r.short).join(" · ")}
        </p>
      </section>

      {/* RADIOS + VOCES */}
      <section className="mx-auto mt-24 grid max-w-6xl gap-3 px-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-line bg-surface p-7 sm:p-10">
          <p className="label text-accent">Próximamente</p>
          <h2 className="display mt-3 text-5xl">Especial radios</h2>
          <p className="mt-3 text-muted">Lo que abren las grandes radios, lo que opinan sus presentadores y las entrevistas del día.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {RADIOS.map((r) => <span key={r} className="label rounded-full border border-line px-3 py-1.5 text-[10px]">{r}</span>)}
          </div>
        </div>
        <Link href="/columnistas" className="group rounded-3xl border border-line bg-surface p-7 hover:border-accent sm:p-10">
          <p className="label text-accent">Opinión</p>
          <h2 className="display mt-3 text-5xl group-hover:text-accent">{COLUMNISTS.length} voces que marcan la conversación</h2>
          <p className="mt-3 text-muted">Columnistas, periodistas y analistas de medios distintos. Su posición no la ponemos nosotros: la medimos con lo que escriben.</p>
          <p className="label mt-6 text-[10px] text-accent">Ver voces →</p>
        </Link>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-accent p-8 text-bg sm:flex-row sm:items-center sm:p-12">
          <div>
            <h2 className="display text-5xl sm:text-6xl">¿Echas en falta un medio o una voz?</h2>
            <p className="mt-2 text-bg/70">Cuantos más puntos de vista, más completa es la foto.</p>
          </div>
          <Link href="/proponer" className="label shrink-0 rounded-full bg-bg px-6 py-4 text-fg">Proponer →</Link>
        </div>
      </section>
    </main>
  );
}
