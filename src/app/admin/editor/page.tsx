import { Suspense } from "react";
import { AdminNav } from "@/components/AdminNav";
import { latestEdition } from "@/lib/editions";
import { sql } from "@/lib/db";
import { COLUMNISTS, OUTLETS, ACCESS_LABEL } from "@/lib/sources";
import { saveNote } from "./actions";

const field = "w-full rounded-xl border border-line bg-bg px-4 outline-none focus:border-accent";

// La página ya está dentro del <Suspense> del layout de /admin, así que puede ser asíncrona.
export default async function Editor({ searchParams }: PageProps<"/admin/editor">) {
  const ed = await latestEdition("es");
  const stories = ed?.stories ?? [];
  const notes = ed ? await sql`select topic_id, outlet_id from editor_notes where created_at > now() - interval '36 hours'` : [];
  const DONE = new Set(notes.map((n) => `${n.topic_id}:${n.outlet_id}`));
  const manual = OUTLETS.filter((o) => o.access === "licencia");
  const total = stories.length * manual.length;
  return (
    <main className="mx-auto max-w-6xl px-4 pt-10">
      <p className="label text-disputed">Back-office · solo editores</p>
      <h1 className="display mt-4 text-6xl sm:text-8xl">Edición</h1>
      <AdminNav active="/admin/editor" />
      <p className="mt-6 max-w-2xl text-muted">
        Lectura humana de los medios que no permiten la lectura automática. Lees la pieza con tu suscripción y
        escribes <b className="text-fg">con tus palabras</b> qué dice. La IA ordena y compara tus notas, nunca el texto del medio.
      </p>
      <Suspense><Flash searchParams={searchParams} /></Suspense>

      {/* Checklist de lectura: temas × medios de lectura humana */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="display text-3xl sm:text-4xl">Por leer hoy</h2>
          <span className="label text-[10px] text-muted">{DONE.size}/{total} lecturas</span>
        </div>
        <div className="no-scrollbar -mx-4 mt-4 overflow-x-auto px-4">
          <table className="w-full min-w-[640px] border-separate border-spacing-1 text-sm">
            <thead>
              <tr>
                <th className="label w-56 text-left text-[9px] font-normal text-muted">Tema</th>
                {manual.map((o) => <th key={o.id} className="label text-[9px] font-normal text-muted">{o.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {stories.map((s) => (
                <tr key={s.id}>
                  <td className="truncate pr-2"><span className="numeral mr-2 text-xl text-accent">{s.rank}</span>{s.headline.slice(0, 38)}…</td>
                  {manual.map((o) => {
                    const done = DONE.has(`${s.id}:${o.id}`);
                    const covers = true; // los medios con reserva no se leen automáticamente: no sabemos si lo cubren hasta leerlos
                    return (
                      <td key={o.id} className={`h-9 rounded-lg text-center ${done ? "bg-accent text-bg" : covers ? "border border-line" : "opacity-20"}`}>
                        {done ? "✓" : covers ? "·" : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="label mt-2 text-[9px] text-muted">✓ leída · punto: pendiente de leer en ese medio</p>
      </section>

      {/* Formulario de nota */}
      <form action={saveNote} className="mt-12 grid gap-4 rounded-3xl border border-line bg-surface p-6 lg:grid-cols-2">
        <h2 className="display text-3xl lg:col-span-2">Nueva lectura</h2>
        <Field label="Tema">
          <select name="storyId" className={`${field} h-12`}>
            {stories.map((s) => <option key={s.id} value={s.id}>{s.rank}. {s.headline}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Medio">
            <select name="outletId" className={`${field} h-12`}>
              {OUTLETS.map((o) => <option key={o.id} value={o.id}>{o.name}{o.access === "licencia" ? "" : " (auto)"}</option>)}
            </select>
          </Field>
          <Field label="Tipo">
            <select name="kind" className={`${field} h-12`}>
              <option value="noticia">Noticia</option><option value="opinion">Opinión</option>
              <option value="analisis">Análisis</option><option value="entrevista">Entrevista</option>
            </select>
          </Field>
        </div>
        <Field label="Enlace a la pieza"><input name="url" type="url" required placeholder="https://…" className={`${field} h-12`} /></Field>
        <Field label="Voz (si es opinión)">
          <select name="columnistId" className={`${field} h-12`}>
            <option value="">—</option>
            {COLUMNISTS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Qué afirma · un dato o hecho por línea">
          <textarea name="claims" required rows={5} className={`${field} py-3`} placeholder={"El proyecto se registró ayer.\nPrevé un déficit del 2,5 %."} />
        </Field>
        <Field label="Cómo lo enfoca · en qué pone el foco, qué omite">
          <textarea name="framing" rows={5} className={`${field} py-3`} />
        </Field>
        <Field label="Valoraciones u opiniones que expresa">
          <textarea name="opinions" rows={3} className={`${field} py-3`} />
        </Field>
        <div className="flex flex-col justify-end gap-4">
          <label className="flex items-start gap-3 text-sm text-muted">
            <input type="checkbox" name="own" className="mt-1 h-4 w-4 accent-[var(--accent)]" />
            He leído la pieza y lo escrito es un resumen mío: no he copiado frases del medio.
          </label>
          <button className="label h-12 rounded-full bg-accent font-semibold text-bg">Guardar y estructurar</button>
        </div>
      </form>

      <section className="mt-12">
        <h2 className="display text-3xl">Estado de los medios</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {OUTLETS.map((o) => (
            <li key={o.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold">{o.name}</span>
              <span className={`label text-[9px] ${o.access === "auto" ? "text-accent" : "text-disputed"}`}>{ACCESS_LABEL[o.access]}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="label mb-1.5 block text-[10px] text-muted">{label}</span>{children}</label>;
}

async function Flash({ searchParams }: { searchParams: PageProps<"/admin/editor">["searchParams"] }) {
  const { ok, error } = await searchParams;
  if (ok) return <p className="mt-6 rounded-xl bg-accent/10 p-4 text-accent">Lectura guardada. Se incorporará al informe del tema.</p>;
  if (error) return <p className="mt-6 rounded-xl bg-disputed/10 p-4 text-disputed">Faltan campos obligatorios o la casilla de redacción propia.</p>;
  return null;
}
