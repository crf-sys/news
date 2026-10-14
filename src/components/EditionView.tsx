import Link from "next/link";
import { latestEdition } from "@/lib/editions";
import { region as regionOf } from "@/lib/regions";
import { RegionTabs } from "./RegionTabs";
import { SpectrumStrip } from "./Coverage";
import { ObjectivityStrip, ConfidenceDot } from "./ObjectivityBadge";
import { ClaimBadge } from "./ClaimBadge";
import type { Story } from "@/lib/types";

const SECTION: Record<string, string> = {
  politica: "Política", economia: "Economía", internacional: "Internacional", sociedad: "Sociedad", tribunales: "Tribunales",
};

const base = (region: string) => (region === "es" ? "" : `/${region}`);

/** Portada o informe del día de un ámbito (nacional o autonómico). */
export async function EditionView({ region, mode }: { region: string; mode: "portada" | "informe" }) {
  const ed = await latestEdition(region);
  const r = regionOf(region)!;
  const d = ed ? new Date(ed.date + "T12:00:00") : new Date();
  const day = d.toLocaleDateString("es-ES", { day: "numeric" });
  const month = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
  const weekday = d.toLocaleDateString("es-ES", { weekday: "long" });
  const time = ed ? new Date(ed.generatedAt).toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit" }) : null;

  return (
    <main className="grain">
      <section className="mx-auto max-w-6xl px-4 pt-6">
        <RegionTabs active={region} />
      </section>
      <section className="mx-auto max-w-6xl px-4 pt-8 pb-6 sm:pt-12">
        <p className="label text-accent">{region === "es" ? "Edición nacional" : `Edición ${r.name}`} · {weekday}{time && ` · actualizada ${time}`}</p>
        <h1 className="display mt-4 text-[22vw] uppercase sm:text-[11rem]">
          {day} <span className="italic text-muted">{month}</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted sm:text-xl">
          Las <span className="text-fg">10 noticias</span> que más pesan hoy{region === "es" ? "" : ` en ${r.name}`}. Hechos separados de opinión, verificados en la fuente cuando hay dudas.
        </p>
        <div className="mt-6 inline-flex rounded-full border border-line p-1">
          <Link href={base(region) || "/"} className={`label rounded-full px-4 py-2 ${mode === "portada" ? "bg-fg text-bg" : "text-muted"}`}>Portada</Link>
          <Link href={`${base(region)}/informe`} className={`label rounded-full px-4 py-2 ${mode === "informe" ? "bg-fg text-bg" : "text-muted"}`}>Informe del día</Link>
        </div>
      </section>

      {!ed ? (
        <section className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl border border-dashed border-line p-10 text-center">
            <p className="display text-4xl">La edición se está preparando</p>
            <p className="mt-3 text-muted">Se publica cada mañana a las 06:00. Vuelve en un rato.</p>
          </div>
        </section>
      ) : mode === "portada" ? (
        <Portada stories={ed.stories} />
      ) : (
        <Informe stories={ed.stories} model={ed.model} />
      )}

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="rounded-3xl bg-accent p-8 text-bg sm:p-14">
          <p className="label">Cada día a las 07:00</p>
          <h2 className="display mt-4 text-5xl sm:text-8xl">Las 10 de hoy,<br /><span className="italic">en tu correo.</span></h2>
          <Link href="/newsletter" className="label mt-8 inline-block rounded-full bg-bg px-6 py-4 text-fg">Suscribirme gratis →</Link>
        </div>
      </section>
    </main>
  );
}

function Portada({ stories }: { stories: Story[] }) {
  const [lead, ...rest] = stories;
  return (
    <>
      <section className="mx-auto max-w-6xl px-4">
        <Link href={`/tema/${lead.id}`} className="group relative block overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-10">
          <span className="numeral pointer-events-none absolute -right-4 -top-10 text-[16rem] text-accent/10 sm:text-[24rem]">1</span>
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="label rounded-full bg-accent px-3 py-1 font-semibold text-bg">Apertura</span>
              <span className="label text-muted">{SECTION[lead.section]}</span>
            </div>
            <h2 className="display mt-6 max-w-4xl text-5xl transition-colors group-hover:text-accent sm:text-7xl">{lead.headline}</h2>
            <p className="mt-5 max-w-2xl text-lg text-muted">{lead.dek}</p>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
              <ObjectivityStrip story={lead} />
              <SpectrumStrip outletIds={lead.coverage.map((c) => c.outletId)} />
            </div>
            <div className="label mt-8 inline-flex items-center gap-2 text-accent">Leer informe objetivo →</div>
          </div>
        </Link>
      </section>
      <section className="mx-auto mt-4 max-w-6xl px-4">
        <ol className="divide-y divide-line">
          {rest.map((s) => (
            <li key={s.id}>
              <Link href={`/tema/${s.id}`} className="group grid grid-cols-[3.5rem_1fr] gap-4 py-7 sm:grid-cols-[7rem_1fr_auto] sm:gap-8">
                <span className="numeral text-6xl text-muted transition-colors group-hover:text-accent sm:text-8xl">{s.rank}</span>
                <div>
                  <span className="label text-muted">{SECTION[s.section]}</span>
                  <h3 className="display mt-2 text-3xl sm:text-4xl">{s.headline}</h3>
                  <p className="mt-2 text-muted">{s.dek}</p>
                  <div className="mt-4"><ObjectivityStrip story={s} /></div>
                </div>
                <div className="hidden items-end sm:flex">
                  <SpectrumStrip outletIds={s.coverage.map((c) => c.outletId)} />
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

/** Todo el día en una página: lo esencial de cada tema, con hechos y disputas a la vista. */
function Informe({ stories, model }: { stories: Story[]; model: string }) {
  const all = stories.flatMap((s) => s.claims);
  const totals = {
    hechos: all.filter((c) => c.status === "hecho").length,
    disputados: all.filter((c) => c.status === "disputado").length,
    opiniones: all.filter((c) => c.status === "opinion").length,
    verificados: all.filter((c) => c.verification?.result === "confirmado").length,
  };
  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[["Hechos", totals.hechos, "bg-fact"], ["En disputa", totals.disputados, "bg-disputed"], ["Opiniones", totals.opiniones, "border border-opinion"], ["Verificados en fuente oficial", totals.verificados, "bg-accent"]].map(([l, n, c]) => (
          <div key={l as string} className="rounded-2xl border border-line bg-surface p-4">
            <div className="numeral text-5xl">{n}</div>
            <div className="label mt-2 flex items-center gap-2 text-[10px] text-muted"><i className={`h-2 w-2 rounded-full ${c}`} />{l}</div>
          </div>
        ))}
      </div>

      <ol className="mt-8 space-y-3">
        {stories.map((s) => {
          const facts = s.claims.filter((c) => c.status === "hecho").slice(0, 3);
          const disputed = s.claims.filter((c) => c.status === "disputado").slice(0, 2);
          return (
            <li key={s.id} className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="numeral text-5xl text-accent sm:text-6xl">{s.rank}</span>
                <div className="min-w-0 flex-1">
                  <p className="label text-[10px] text-muted">{SECTION[s.section]}</p>
                  <h2 className="display mt-1 text-3xl sm:text-4xl">{s.headline}</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="label mb-2 text-[10px] text-muted">Lo que se sabe</p>
                  <ul className="space-y-2">
                    {facts.map((c) => <li key={c.text} className="border-l-2 border-fact pl-3 text-[15px] leading-snug">{c.text}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="label mb-2 text-[10px] text-muted">{disputed.length ? "Lo que está en disputa" : "Sin disputas relevantes"}</p>
                  <ul className="space-y-2">
                    {disputed.map((c) => <li key={c.text} className="border-l-2 border-disputed pl-3 text-[15px] leading-snug">{c.text}</li>)}
                  </ul>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <ObjectivityStrip story={s} />
                <Link href={`/tema/${s.id}`} className="label text-[10px] text-accent">Informe completo →</Link>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="label mt-6 text-[9px] text-muted">
        Generado automáticamente con IA ({model.replace("anthropic/", "")}) siguiendo nuestro <Link href="/metodologia" className="underline">criterio de objetividad</Link>.
        <span className="ml-2"><ClaimBadge status="hecho" /> <ClaimBadge status="disputado" /> <ClaimBadge status="opinion" /></span>
      </p>
      <span className="hidden"><ConfidenceDot level="alta" /></span>
    </section>
  );
}
