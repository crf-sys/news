import Link from "next/link";
import { notFound } from "next/navigation";
import { COLUMNISTS, columnist, outlet, affiliation } from "@/lib/sources";
import { profile } from "@/lib/columnists-mock";
import { TODAY } from "@/lib/mock";
import { AxisBar } from "@/components/AxisBar";

export function generateStaticParams() {
  return COLUMNISTS.map((c) => ({ id: c.id }));
}

export default async function ColumnistaPage({ params }: PageProps<"/columnista/[id]">) {
  const { id } = await params;
  const c = COLUMNISTS.find((x) => x.id === id) && columnist(id);
  const p = profile(id);
  if (!c || !p) notFound();
  const today = TODAY.stories.flatMap((s) => s.opinions.filter((o) => o.columnistId === id).map((o) => ({ s, o })));

  return (
    <main className="grain">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:pt-14">
        <Link href="/columnistas" className="label text-muted hover:text-fg">← Columnistas</Link>

        {/* Cabecera */}
        <header className="mt-8">
          <p className="label text-accent">{affiliation(c)} · desde {p.since} · {p.frequency}</p>
          <h1 className="display mt-4 text-7xl sm:text-[9rem]">{c.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{p.bio}</p>
          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4">
            <Stat n={p.articlesAnalyzed} label="Textos analizados" />
            <Stat n={p.featured.length} label="Destacados" />
            <Stat n={p.axes.filter((a) => a.evidence >= 8).length} label="Ejes con datos" />
          </div>
        </header>

        {/* Ficha ideológica */}
        <section className="pt-16">
          <p className="label text-muted">Ficha ideológica · basada en evidencia</p>
          <h2 className="display mt-2 text-5xl sm:text-7xl">Dónde se sitúa</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Cada punto es la media de las posturas explícitas en sus columnas. La banda indica la incertidumbre.
            No es una etiqueta: es una medición que cambia si cambia lo que escribe.
          </p>
          <div className="mt-10 space-y-10">
            {p.axes.map((a) => (
              <div key={a.id}>
                <AxisBar axis={a} />
                {a.examples.length > 0 && (
                  <details className="mt-3 rounded-2xl border border-line p-4">
                    <summary className="label cursor-pointer text-[10px] text-muted">Ver pruebas ({a.examples.length})</summary>
                    <ul className="mt-3 space-y-2">
                      {a.examples.map((e) => (
                        <li key={e.quote} className="text-sm"><a href={e.url} className="italic hover:text-accent">“{e.quote}”</a> <span className="text-muted">· {e.date}</span></li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Tono hacia actores */}
        <section className="pt-16">
          <p className="label text-muted">Cuando escribe sobre…</p>
          <h2 className="display mt-2 text-5xl sm:text-7xl">Tono hacia actores</h2>
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {p.stance.map((s) => (
              <li key={s.actor} className="grid grid-cols-[1fr_auto] items-center gap-4 py-4 sm:grid-cols-[14rem_1fr_auto]">
                <span className="font-semibold">{s.actor}</span>
                <div className="relative col-span-2 h-2 rounded-full bg-line sm:col-span-1 sm:row-start-1 sm:col-start-2">
                  <div className="absolute inset-y-0 left-1/2 w-px bg-muted" />
                  <div className={`absolute inset-y-0 rounded-full ${s.tone >= 0 ? "bg-fg" : "bg-disputed"}`}
                    style={s.tone >= 0 ? { left: "50%", width: `${s.tone * 50}%` } : { right: "50%", width: `${-s.tone * 50}%` }} />
                </div>
                <span className="label row-start-1 col-start-2 text-[10px] text-muted sm:col-start-3">{s.mentions} menciones</span>
              </li>
            ))}
          </ul>
          <div className="label mt-2 flex justify-between text-[10px] text-muted"><span>Crítico</span><span>Favorable</span></div>
        </section>

        {/* Temas */}
        <section className="pt-16">
          <h2 className="display text-5xl sm:text-7xl">De qué escribe</h2>
          <div className="mt-8 flex h-14 overflow-hidden rounded-2xl">
            {p.topics.map((t, i) => (
              <div key={t.topic} className="flex items-end p-2" style={{ width: `${t.share * 100}%`, background: `rgba(228,255,58,${0.9 - i * 0.17})` }}>
                <span className="label hidden text-[9px] text-bg sm:block">{Math.round(t.share * 100)}%</span>
              </div>
            ))}
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {p.topics.map((t) => <li key={t.topic} className="label text-[10px] text-muted">{t.topic} · {Math.round(t.share * 100)}%</li>)}
          </ul>
        </section>

        {/* Hoy */}
        {today.length > 0 && (
          <section className="pt-16">
            <h2 className="display text-5xl sm:text-7xl">Hoy opina sobre</h2>
            <ul className="mt-6 space-y-3">
              {today.map(({ s, o }) => (
                <li key={s.id}>
                  <Link href={`/tema/${s.id}#opinion`} className="block rounded-2xl border border-opinion/40 p-5 hover:border-opinion">
                    <p className="label text-[10px] text-opinion">Opinión · Tema nº {s.rank}</p>
                    <p className="display mt-2 text-2xl">{s.headline}</p>
                    <p className="mt-2 italic text-muted">“{o.take}”</p>
                    <p className="label mt-4 text-[10px] text-accent">Ver otras {s.opinions.length - 1} visiones de este tema →</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Destacados */}
        <section className="pt-16">
          <h2 className="display text-5xl sm:text-7xl">Artículos destacados</h2>
          <ol className="mt-6 divide-y divide-line border-y border-line">
            {p.featured.map((f, i) => (
              <li key={f.title}>
                <a href={f.url} className="group grid grid-cols-[3rem_1fr] gap-4 py-6">
                  <span className="numeral text-5xl text-muted group-hover:text-accent">{i + 1}</span>
                  <div>
                    <p className="display text-3xl group-hover:text-accent">{f.title}</p>
                    <p className="label mt-2 text-[10px] text-muted">{f.date} · {f.why}</p>
                  </div>
                </a>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
      <div className="numeral text-5xl sm:text-7xl">{n}</div>
      <div className="label mt-3 text-[10px] text-muted">{label}</div>
    </div>
  );
}
