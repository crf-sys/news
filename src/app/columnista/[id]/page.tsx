import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { COLUMNISTS, VOICE_KIND_LABEL, affiliation } from "@/lib/sources";
import { profile } from "@/lib/profiles";
import { latestEdition } from "@/lib/editions";
import { AxisBar } from "@/components/AxisBar";

const AXES = [
  ["Económico", "Más Estado", "Más mercado"],
  ["Social", "Progresista", "Conservador"],
  ["Territorial", "Descentralización", "Centralización"],
  ["Europa", "Más integración", "Más soberanía"],
  ["Institucional", "Reformista", "Conservación"],
] as const;

export function generateStaticParams() {
  return COLUMNISTS.map((c) => ({ id: c.id }));
}

export default async function ColumnistaPage({ params }: PageProps<"/columnista/[id]">) {
  const { id } = await params;
  const c = COLUMNISTS.find((x) => x.id === id);
  if (!c) notFound();
  const p = profile(id);

  return (
    <main className="grain">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:pt-14">
        <Link href="/columnistas" className="label text-muted hover:text-fg">← Voces</Link>
        <header className="mt-8">
          <p className="label text-accent">{VOICE_KIND_LABEL[c.kind]} · {affiliation(c)}</p>
          <h1 className="display mt-4 text-6xl sm:text-[8rem]">{c.name}</h1>
          {c.inclusionReason && (
            <div className="mt-6 max-w-2xl rounded-2xl border border-line bg-surface p-5">
              <p className="label text-[10px] text-muted">Por qué está en el panel</p>
              <p className="mt-2 text-lg">{c.inclusionReason}</p>
            </div>
          )}
          {c.authorUrl && <a href={c.authorUrl} target="_blank" rel="noreferrer" className="label mt-4 inline-block text-[10px] text-muted underline">Sus textos en {affiliation(c)} ↗</a>}
        </header>

        <section className="pt-16">
          <p className="label text-muted">Ficha ideológica · basada en evidencia</p>
          <h2 className="display mt-2 text-5xl sm:text-7xl">Dónde se sitúa</h2>
          {p ? (
            <div className="mt-10 space-y-10">{p.axes.map((a) => <AxisBar key={a.id} axis={a} />)}</div>
          ) : (
            <>
              <div className="mt-6 rounded-3xl border border-disputed/50 bg-disputed/5 p-6">
                <p className="display text-3xl text-disputed">En calibración</p>
                <p className="mt-2 max-w-2xl text-muted">
                  Aún no hemos analizado suficientes textos para situarle con rigor. No ponemos etiquetas a ojo: la posición
                  se calcula sobre al menos 30 piezas, eje por eje, y cada punto enlaza a las frases que lo justifican.
                </p>
              </div>
              <div className="mt-10 space-y-8 opacity-40">
                {AXES.map(([label, a, b]) => (
                  <div key={label}>
                    <div className="flex justify-between"><span className="display text-2xl">{label}</span><span className="label text-[10px] text-muted">Sin medir</span></div>
                    <div className="mt-3 h-10 rounded-full border border-dashed border-line" />
                    <div className="label mt-2 flex justify-between text-[10px] text-muted"><span>{a}</span><span>{b}</span></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <Suspense>
          <Today id={id} />
        </Suspense>
      </div>
    </main>
  );
}

async function Today({ id }: { id: string }) {
  const ed = await latestEdition("es");
  const items = (ed?.stories ?? []).flatMap((s) => s.opinions.filter((o) => o.columnistId === id).map((o) => ({ s, o })));
  if (!items.length) return null;
  return (
    <section className="pt-16">
      <h2 className="display text-5xl sm:text-7xl">Hoy opina sobre</h2>
      <ul className="mt-6 space-y-3">
        {items.map(({ s, o }) => (
          <li key={s.id}>
            <Link href={`/tema/${s.id}#opinion`} className="block rounded-2xl border border-opinion/40 p-5 hover:border-opinion">
              <p className="label text-[10px] text-opinion">Opinión · Tema nº {s.rank}</p>
              <p className="display mt-2 text-2xl">{s.headline}</p>
              <p className="mt-2 italic text-muted">“{o.take}”</p>
              <p className="label mt-4 text-[10px] text-accent">Ver las otras {s.opinions.length - 1} visiones →</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
