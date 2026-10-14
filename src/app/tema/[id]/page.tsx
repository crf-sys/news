import Link from "next/link";
import { notFound } from "next/navigation";
import { TODAY, story as getStory } from "@/lib/mock";
import { outlet } from "@/lib/sources";
import { OtherViews } from "@/components/OtherViews";
import { ClaimBadge } from "@/components/ClaimBadge";
import { CoverageMeter, SpectrumStrip } from "@/components/Coverage";
import type { ClaimStatus } from "@/lib/types";

export function generateStaticParams() {
  return TODAY.stories.map((s) => ({ id: s.id }));
}

const TABS = [
  ["hechos", "Hechos"],
  ["enfoques", "Enfoques"],
  ["opinion", "Opinión"],
  ["contexto", "Contexto"],
] as const;

export default async function TemaPage({ params }: PageProps<"/tema/[id]">) {
  const { id } = await params;
  const s = getStory(id);
  if (!s) notFound();

  const count = (st: ClaimStatus) => s.claims.filter((c) => c.status === st).length;
  const covering = s.coverage.map((c) => c.outletId);

  return (
    <main className="grain">
      <article className="mx-auto max-w-4xl px-4 pt-8 sm:pt-14">
        <Link href="/" className="label text-muted hover:text-fg">← Las 10 de hoy</Link>
        <div className="mt-8 flex items-center gap-4">
          <span className="numeral text-7xl text-accent sm:text-9xl">{s.rank}</span>
          <span className="label text-muted">Informe objetivo<br />{TODAY.date}</span>
        </div>
        <h1 className="display mt-6 text-5xl sm:text-8xl">{s.headline}</h1>
        <p className="mt-6 text-xl text-muted">{s.dek}</p>

        {/* Resumen numérico: lo primero que se ve en móvil */}
        <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-4">
          {(["hecho", "disputado", "opinion"] as const).map((st) => (
            <div key={st} className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
              <div className="numeral text-5xl sm:text-7xl">{count(st)}</div>
              <div className="mt-3"><ClaimBadge status={st} /></div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="label text-muted">Quién lo cubre</span>
            <CoverageMeter story={s} />
          </div>
          <div className="mt-5"><SpectrumStrip outletIds={covering} big /></div>
        </div>

        {/* Navegación de secciones fija en móvil */}
        <nav className="no-scrollbar sticky top-[6.5rem] z-20 -mx-4 mt-10 flex gap-2 overflow-x-auto bg-bg/85 px-4 py-3 backdrop-blur sm:top-14">
          {TABS.map(([anchor, label]) => (
            <a key={anchor} href={`#${anchor}`} className="label shrink-0 rounded-full border border-line px-4 py-2 hover:border-accent hover:text-accent">
              {label}
            </a>
          ))}
        </nav>

        <Section id="hechos" title="Qué ha pasado" kicker="Afirmaciones y quién las sostiene">
          <ul className="space-y-3">
            {s.claims.map((c, i) => (
              <li key={i} className="rounded-2xl border border-line p-5">
                <ClaimBadge status={c.status} />
                <p className={`mt-3 text-xl leading-snug ${c.status === "opinion" ? "italic text-muted" : ""}`}>{c.text}</p>
                <p className="label mt-3 text-[10px] text-muted">
                  {c.outletIds.length} {c.outletIds.length === 1 ? "medio" : "medios"} · {c.outletIds.map((o) => outlet(o).name).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        {s.framings.length > 0 && (
          <Section id="enfoques" title="Cómo lo cuenta cada lado" kicker="Mismo hecho, distinto foco">
            <div className="grid gap-3 sm:grid-cols-3">
              {s.framings.map((f) => (
                <div key={f.lean} className="rounded-2xl border border-line bg-surface p-5">
                  <p className="label text-accent">{f.lean}</p>
                  <p className="mt-3 text-lg leading-snug">{f.summary}</p>
                  <p className="label mt-4 text-[10px] text-muted">{f.outletIds.map((o) => outlet(o).name).join(" · ")}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {s.opinions.length > 0 && (
          <Section id="opinion" title="Otras visiones" kicker={`${s.opinions.length} voces del panel · opinión, marcada como tal`}>
            <OtherViews story={s} />
          </Section>
        )}

        {(s.context.length > 0 || s.openQuestions.length > 0) && (
          <Section id="contexto" title="Para entenderlo" kicker="Contexto y preguntas abiertas">
            <ul className="space-y-3 text-lg">
              {s.context.map((c) => <li key={c} className="border-l-2 border-accent pl-4">{c}</li>)}
            </ul>
            {s.openQuestions.length > 0 && (
              <ul className="mt-8 space-y-2">
                {s.openQuestions.map((q) => <li key={q} className="display text-2xl text-muted">{q}</li>)}
              </ul>
            )}
          </Section>
        )}
      </article>
    </main>
  );
}

function Section({ id, title, kicker, children }: { id: string; title: string; kicker: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-40 pt-14">
      <p className="label text-muted">{kicker}</p>
      <h2 className="display mb-6 mt-2 text-4xl sm:text-6xl">{title}</h2>
      {children}
    </section>
  );
}
