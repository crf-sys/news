import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findStory } from "@/lib/editions";
import { ACTIVE_REGIONS, region as regionOf } from "@/lib/regions";
import { outlet } from "@/lib/sources";
import { OtherViews } from "@/components/OtherViews";
import { ClaimBadge } from "@/components/ClaimBadge";
import { SourceChips, Versions } from "@/components/SourceChips";
import { BlindSpot } from "@/components/BlindSpot";
import { ShareButtons } from "@/components/ShareButtons";
import { SpectrumStrip } from "@/components/Coverage";
import { ConfidenceDot, CoverageCount } from "@/components/ObjectivityBadge";
import type { ClaimStatus, Story } from "@/lib/types";

const TABS = [
  ["objetividad", "Objetividad"],
  ["hechos", "Hechos"],
  ["enfoques", "Enfoques"],
  ["opinion", "Opinión"],
  ["fuentes", "Fuentes"],
] as const;

const name = (id: string) => outlet(id)?.name ?? id;

export async function generateMetadata({ params }: PageProps<"/tema/[id]">) {
  const { id } = await params;
  const found = await findStory(id, ACTIVE_REGIONS.map((r) => r.id));
  if (!found) return { title: "Ágora" };
  return { title: `${found.story.headline} · Ágora`, description: found.story.dek };
}

export default function TemaPage({ params }: PageProps<"/tema/[id]">) {
  return (
    <Suspense fallback={<p className="label mx-auto max-w-4xl px-4 pt-16 text-muted">Cargando el informe…</p>}>
      <Tema params={params} />
    </Suspense>
  );
}

async function Tema({ params }: { params: PageProps<"/tema/[id]">["params"] }) {
  const { id } = await params;
  const found = await findStory(id, ACTIVE_REGIONS.map((r) => r.id));
  if (!found) notFound();
  const { story: s, edition } = found;
  const r = regionOf(edition.region)!;
  const count = (st: ClaimStatus) => s.claims.filter((c) => c.status === st).length;
  const o = s.objectivity;

  return (
    <main className="grain">
      <article className="mx-auto max-w-4xl px-4 pt-8 sm:pt-14">
        <Link href={edition.region === "es" ? "/" : `/${edition.region}`} className="label text-muted hover:text-fg">
          ← Las 10 de hoy · {r.short}
        </Link>
        <div className="mt-8 flex items-center gap-4">
          <span className="numeral text-7xl text-accent sm:text-9xl">{s.rank}</span>
          <span className="label text-muted">Informe objetivo<br />{new Date(edition.date + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long" })}</span>
        </div>
        <div className="mt-6"><BlindSpot story={s} big /></div>
        <h1 className="display mt-4 text-5xl sm:text-7xl">{s.headline}</h1>
        <p className="mt-6 text-xl text-muted">{s.dek}</p>
        <div className="mt-6"><ShareButtons title={s.headline} path={`/tema/${s.id}`} /></div>
        {o && <div className="mt-6"><CoverageCount outlets={o.outlets} total={o.outletsTotal} big /></div>}

        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
          {(["hecho", "disputado", "sin_contrastar", "opinion"] as const).map((st) => (
            <a key={st} href="#hechos" className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
              <div className="numeral text-5xl sm:text-7xl">{count(st)}</div>
              <div className="mt-3"><ClaimBadge status={st} /></div>
            </a>
          ))}
        </div>

        <nav className="no-scrollbar sticky top-[6.5rem] z-20 -mx-4 mt-10 flex gap-2 overflow-x-auto bg-bg/85 px-4 py-3 backdrop-blur sm:top-14">
          {TABS.map(([anchor, label]) => (
            <a key={anchor} href={`#${anchor}`} className="label shrink-0 rounded-full border border-line px-4 py-2 hover:border-accent hover:text-accent">{label}</a>
          ))}
        </nav>

        {o && (
          <Section id="objetividad" title="Panel de objetividad" kicker="Lo que medimos de este tema">
            <div className="grid gap-3 sm:grid-cols-2">
              <Box title="Cobertura">
                <CoverageCount outlets={o.outlets} total={o.outletsTotal} />
                <div className="mt-5"><SpectrumStrip outletIds={s.coverage.map((c) => c.outletId)} big /></div>
                <p className="mt-3 text-sm text-muted">{s.coverage.map((c) => name(c.outletId)).join(" · ")}</p>
              </Box>
              <Box title="Verificación">
                <p className="numeral text-6xl">{o.verified}</p>
                <p className="mt-1 text-muted">afirmaciones confirmadas en fuente oficial o verificador independiente</p>
                <div className="mt-4"><ConfidenceDot level={o.confidence} /></div>
              </Box>
              <Box title="Lenguaje cargado">
                {o.loadedLanguage.length ? (
                  <ul className="space-y-2">
                    {o.loadedLanguage.map((l, i) => (
                      <li key={i} className="text-[15px]">
                        <span className="label text-[9px] text-muted">{name(l.outletId)}</span><br />
                        <span className="text-disputed line-through decoration-1">{l.term}</span> <span className="text-muted">→</span> <span>{l.neutral}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-muted">No se ha detectado adjetivación valorativa relevante.</p>}
              </Box>
              <Box title="Lo que cada medio no cuenta">
                {o.omissions.length ? (
                  <ul className="space-y-2">
                    {o.omissions.map((m, i) => <li key={i} className="text-[15px]"><span className="label text-[9px] text-muted">{name(m.outletId)}</span><br />{m.note}</li>)}
                  </ul>
                ) : <p className="text-muted">Sin omisiones relevantes entre los medios analizados.</p>}
              </Box>
            </div>
          </Section>
        )}

        <Section id="hechos" title="Qué ha pasado" kicker="Cada afirmación, con su etiqueta y sus fuentes">
          <ul className="space-y-3">
            {s.claims.map((c, i) => (
              <li key={i} className={`rounded-2xl border p-5 ${c.status === "disputado" ? "border-disputed/50" : "border-line"}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <ClaimBadge status={c.status} />
                  {c.verification && <Verification v={c.verification} />}
                </div>
                <p className={`mt-3 text-xl leading-snug ${c.status === "opinion" ? "italic text-muted" : ""}`}>{c.text}</p>
                {c.versions?.length ? (
                  <Versions claim={c} />
                ) : (
                  c.outletIds.length > 0 && <div className="mt-3"><SourceChips sources={c.sources} outletIds={c.outletIds} /></div>
                )}
                {c.verification?.note && <p className="mt-2 text-sm text-muted">{c.verification.note}</p>}
              </li>
            ))}
          </ul>
        </Section>

        {s.framings.length > 0 && (
          <Section id="enfoques" title="Cómo lo cuenta cada lado" kicker="Mismo hecho, distinto foco · según la línea editorial de cada medio">
            <div className="grid gap-3 sm:grid-cols-3">
              {s.framings.map((f) => (
                <div key={f.lean} className="rounded-2xl border border-line bg-surface p-5">
                  <p className="label text-accent">{f.lean}</p>
                  <p className="mt-3 text-lg leading-snug">{f.summary}</p>
                  <p className="label mt-4 text-[10px] text-muted">{f.outletIds.map(name).join(" · ")}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {s.opinions.length > 0 && (
          <Section id="opinion" title="Otras visiones" kicker={`${s.opinions.length} ${s.opinions.length === 1 ? "pieza" : "piezas"} de opinión · marcadas como tal`}>
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

        {s.sources && (
          <Section id="fuentes" title="Fuentes" kicker="Todas las piezas analizadas, enlazadas al original">
            <ul className="divide-y divide-line border-y border-line">
              {s.sources.map((src) => (
                <li key={src.url + src.outletId}>
                  <a href={src.url} target="_blank" rel="noreferrer" className="block py-3 hover:text-accent">
                    <span className="label text-[9px] text-muted">{name(src.outletId)}</span><br />{src.title} ↗
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </article>
    </main>
  );
}

function Verification({ v }: { v: NonNullable<Story["claims"][number]["verification"]> }) {
  const style = v.result === "confirmado" ? "bg-accent/15 text-accent" : v.result === "contradicho" ? "bg-disputed/15 text-disputed" : "text-muted border border-line";
  const label = v.result === "confirmado" ? "✓ Confirmado" : v.result === "contradicho" ? "✗ Contradicho" : "Sin verificar";
  const inner = <span className={`label rounded-full px-2.5 py-1 text-[10px] ${style}`}>{label}{v.sourceName ? ` · ${v.sourceName}` : ""}</span>;
  return v.sourceUrl ? <a href={v.sourceUrl} target="_blank" rel="noreferrer" className="hover:underline">{inner} ↗</a> : inner;
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="label mb-4 text-[10px] text-muted">{title}</p>
      {children}
    </div>
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
