import { Suspense } from "react";
import Link from "next/link";
import { COLUMNISTS, OUTLETS, VOICE_KIND_LABEL, LEAN_LABEL, affiliation } from "@/lib/sources";
import { profile } from "@/lib/columnists-mock";
import { createVoice } from "./actions";

const field = "h-12 w-full rounded-xl border border-line bg-bg px-4 outline-none focus:border-accent";

export default function Admin({ searchParams }: PageProps<"/admin">) {
  return (
    <main className="mx-auto max-w-6xl px-4 pt-10">
      <p className="label text-disputed">Back-office · solo editores</p>
      <h1 className="display mt-4 text-6xl sm:text-8xl">Voces</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Alta de columnistas, líderes de opinión, periodistas y académicos. Todo lo que se registra aquí es público
        (incluido el motivo de inclusión): la transparencia empieza por saber a quién leemos y por qué.
      </p>
      <Suspense><Flash searchParams={searchParams} /></Suspense>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        {/* Formulario de alta */}
        <form action={createVoice} className="space-y-4 rounded-3xl border border-line bg-surface p-6">
          <h2 className="display text-3xl">Nueva voz</h2>
          <Field label="Nombre"><input name="name" required className={field} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo">
              <select name="kind" className={field}>
                {Object.entries(VOICE_KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Medio principal">
              <select name="outletId" className={field}>
                <option value="independiente">Independiente</option>
                {OUTLETS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Página de autor / RSS"><input name="feedUrl" type="url" placeholder="https://…" className={field} /></Field>
          <Field label="Newsletter (email de alta en buzón de ingesta)"><input name="newsletter" placeholder="ej. su Substack" className={field} /></Field>
          <Field label="Redes / web"><input name="social" placeholder="X, Bluesky, pódcast…" className={field} /></Field>
          <Field label="Motivo de inclusión (público)">
            <textarea name="reason" required rows={3} placeholder="Alcance, relevancia, aporta una perspectiva que falta en el panel…" className={`${field} h-auto py-3`} />
          </Field>
          <p className="text-sm text-muted">La posición ideológica <b className="text-fg">no se introduce a mano</b>: se calcula a partir de sus textos tras el alta (backfill de 12 meses).</p>
          <button className="label h-12 w-full rounded-full bg-accent font-semibold text-bg">Dar de alta y analizar</button>
        </form>

        {/* Panel actual */}
        <div>
          <h2 className="display text-3xl">Panel actual · {COLUMNISTS.length}</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {COLUMNISTS.map((c) => {
              const p = profile(c.id);
              return (
                <li key={c.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <Link href={`/columnista/${c.id}`} className="font-semibold hover:text-accent">{c.name}</Link>
                    <p className="label mt-1 text-[9px] text-muted">{VOICE_KIND_LABEL[c.kind]} · {affiliation(c)}</p>
                  </div>
                  <div className="text-right">
                    <p className="label text-[9px]">{LEAN_LABEL[c.lean]}</p>
                    <p className="label mt-1 text-[9px] text-muted">{p ? `${p.articlesAnalyzed} textos` : "en calibración"}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 rounded-3xl border border-dashed border-line p-6">
            <h3 className="display text-2xl">Equilibrio del panel</h3>
            <div className="mt-4 flex items-end gap-2 h-20">
              {([-2, -1, 0, 1, 2] as const).map((l) => {
                const n = COLUMNISTS.filter((c) => c.lean === l).length;
                return <div key={l} className="flex flex-1 flex-col items-center gap-1"><div className="w-full rounded-t bg-fg/70" style={{ height: `${n * 14}px` }} /><span className="label text-[9px] text-muted">{n}</span></div>;
              })}
            </div>
            <p className="mt-3 text-sm text-muted">Aviso automático si un bloque queda infrarrepresentado.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="label mb-1.5 block text-[10px] text-muted">{label}</span>{children}</label>;
}

async function Flash({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const { ok, error } = await searchParams;
  if (ok) return <p className="mt-6 rounded-xl bg-accent/10 p-4 text-accent">Voz registrada. Analizando sus últimos 12 meses…</p>;
  if (error) return <p className="mt-6 rounded-xl bg-disputed/10 p-4 text-disputed">Faltan nombre o motivo de inclusión.</p>;
  return null;
}
