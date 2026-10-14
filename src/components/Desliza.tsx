import Link from "next/link";
import { latestEdition } from "@/lib/editions";
import { region as regionOf } from "@/lib/regions";
import { spectrumOf } from "@/lib/coverage";
import { BlindSpot } from "./BlindSpot";
import { CoverageCount } from "./ObjectivityBadge";
import { SourceChips } from "./SourceChips";

/** Las 10 del día a pantalla completa, una por tarjeta, deslizando en vertical (estilo stories). */
export async function Desliza({ region }: { region: string }) {
  const ed = await latestEdition(region);
  const r = regionOf(region)!;
  const back = region === "es" ? "/" : `/${region}`;
  if (!ed) return <p className="p-10 text-muted">La edición se está preparando.</p>;
  const total = ed.stories.length;

  return (
    <div className="fixed inset-0 z-50 snap-y snap-mandatory overflow-y-scroll bg-bg">
      <Link href={back} aria-label="Cerrar" className="label fixed right-4 top-4 z-10 rounded-full border border-line bg-bg/80 px-4 py-2 backdrop-blur">✕</Link>

      {/* Portada */}
      <section className="grain relative flex h-dvh snap-start flex-col justify-end px-6 pb-16">
        <p className="label text-accent">{region === "es" ? "Edición nacional" : r.name} · {new Date(ed.date + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1 className="display rise mt-4 text-[22vw] leading-[0.85] sm:text-9xl">Las 10<br /><span className="italic text-muted">de hoy.</span></h1>
        <p className="rise mt-6 max-w-sm text-lg text-muted" style={{ animationDelay: "150ms" }}>Hechos separados de opinión. Desliza hacia arriba.</p>
        <span aria-hidden className="mt-10 animate-bounce text-3xl text-accent">↑</span>
      </section>

      {ed.stories.map((s) => {
        const sp = spectrumOf(s);
        const facts = s.claims.filter((c) => c.status === "hecho").slice(0, 2);
        const disputed = s.claims.find((c) => c.status === "disputado" && c.versions?.length);
        return (
          <section key={s.id} className="relative flex h-dvh snap-start flex-col justify-center overflow-hidden px-5 pb-14 pt-16">
            <span aria-hidden className="numeral pointer-events-none absolute -right-6 -top-6 text-[18rem] leading-none text-accent/10">{s.rank}</span>
            <div className="reveal relative mx-auto w-full max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="label text-[10px] text-muted">{s.rank} / {total}</span>
                <BlindSpot story={s} />
              </div>
              <h2 className="display mt-3 line-clamp-4 text-[2rem] leading-[1.02] sm:text-6xl">{s.headline}</h2>
              <div className="mt-4"><CoverageCount outlets={sp.outlets} total={s.objectivity?.outletsTotal} /></div>

              {facts.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {facts.map((c) => <li key={c.text} className="line-clamp-3 border-l-2 border-fact pl-3 text-[14px] leading-snug">{c.text}</li>)}
                </ul>
              )}
              {disputed && (
                <div className="mt-4 rounded-2xl border border-disputed/40 p-3">
                  <p className="label line-clamp-2 text-[9px] text-disputed">En disputa · {disputed.text}</p>
                  <ul className="mt-2 space-y-2 text-[14px] leading-snug">
                    {disputed.versions!.slice(0, 2).map((v, i) => (
                      <li key={i}><span className="line-clamp-2"><b className="font-semibold">{i === 0 ? "Unos dicen" : "Otros dicen"}:</b> {v.text}</span> <SourceChips sources={v.sources.slice(0, 2)} /></li>
                    ))}
                  </ul>
                </div>
              )}
              <Link href={`/tema/${s.id}`} className="label mt-5 inline-block rounded-full bg-accent px-5 py-3 font-semibold text-bg">Informe completo →</Link>
            </div>
            <div className="absolute inset-x-6 bottom-6 flex gap-1">
              {Array.from({ length: total }, (_, i) => <i key={i} className={`h-1 flex-1 rounded-full ${i < s.rank ? "bg-accent" : "bg-line"}`} />)}
            </div>
          </section>
        );
      })}

      {/* Cierre */}
      <section className="flex h-dvh snap-start flex-col justify-center px-6">
        <div className="mx-auto w-full max-w-xl">
          <p className="label text-accent">Ya estás al día</p>
          <h2 className="display mt-4 text-6xl leading-[0.95]">Mañana,<br /><span className="italic">en tu correo.</span></h2>
          <p className="mt-4 text-lg text-muted">Las 10 de hoy, cada día a las 07:00. Gratis.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/newsletter" className="label rounded-full bg-accent px-6 py-4 font-semibold text-bg">Regístrate gratis</Link>
            <Link href={`${back === "/" ? "" : back}/informe`} className="label rounded-full border border-line px-6 py-4">Ver el informe del día</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
