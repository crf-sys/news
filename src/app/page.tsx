import Link from "next/link";
import { TODAY } from "@/lib/mock";
import { CoverageMeter, SpectrumStrip } from "@/components/Coverage";

const SECTION: Record<string, string> = {
  politica: "Política", economia: "Economía", internacional: "Internacional", sociedad: "Sociedad", tribunales: "Tribunales",
};

export default function Home() {
  const [lead, ...rest] = TODAY.stories;
  const d = new Date(TODAY.date);
  const day = d.toLocaleDateString("es-ES", { day: "numeric" });
  const month = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
  const weekday = d.toLocaleDateString("es-ES", { weekday: "long" });

  return (
    <main className="grain">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-8 sm:pt-16">
        <p className="label text-accent">Edición diaria · {weekday} · actualizada 06:30</p>
        <h1 className="display mt-4 text-[22vw] uppercase sm:text-[11rem]">
          {day} <span className="italic text-muted">{month}</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted sm:text-xl">
          Las <span className="text-fg">10 noticias</span> que más pesan hoy en los 10 grandes medios. Hechos separados de opinión.
        </p>
        <div className="label mt-6 text-[10px] text-muted">Datos de ejemplo · prototipo</div>
      </section>

      {/* APERTURA */}
      <section className="mx-auto max-w-6xl px-4">
        <Link href={`/tema/${lead.id}`} className="group relative block overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-10">
          <span className="numeral pointer-events-none absolute -right-4 -top-10 text-[16rem] text-accent/10 sm:text-[24rem]">1</span>
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="label rounded-full bg-accent px-3 py-1 font-semibold text-bg">Apertura</span>
              <span className="label text-muted">{SECTION[lead.section]}</span>
            </div>
            <h2 className="display mt-6 max-w-4xl text-5xl sm:text-7xl group-hover:text-accent transition-colors">{lead.headline}</h2>
            <p className="mt-5 max-w-2xl text-lg text-muted">{lead.dek}</p>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
              <CoverageMeter story={lead} />
              <SpectrumStrip outletIds={lead.coverage.map((c) => c.outletId)} />
            </div>
            <div className="label mt-8 inline-flex items-center gap-2 text-accent">Leer informe objetivo →</div>
          </div>
        </Link>
      </section>

      {/* 2–10 */}
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
                  <div className="mt-4 sm:hidden"><CoverageMeter story={s} /></div>
                </div>
                <div className="hidden flex-col items-end justify-between gap-4 sm:flex">
                  <CoverageMeter story={s} />
                  <SpectrumStrip outletIds={s.coverage.map((c) => c.outletId)} />
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA newsletter */}
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
