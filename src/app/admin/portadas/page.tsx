import { connection } from "next/server";
import { AdminNav } from "@/components/AdminNav";
import { sql } from "@/lib/db";
import { latestEdition } from "@/lib/editions";
import { OUTLETS } from "@/lib/sources";
import { saveFrontPage } from "./actions";

// Lectura asistida: el editor abre la portada de cada medio con su navegador, como cualquier lector,
// y marca aquí qué temas del día lleva y en qué posición. Así el recuento de cobertura incluye
// también a los medios que no permiten la lectura automática.
export default async function Portadas() {
  await connection(); // la fecha de "hoy" se calcula en cada petición, no al compilar
  const ed = await latestEdition("es");
  const day = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
  const manual = OUTLETS.filter((o) => o.access === "licencia");
  const [reviews, marks] = await Promise.all([
    sql`select outlet_id, editor, reviewed_at from front_page_reviews where day = ${day}`,
    sql`select outlet_id, topic_id, position from front_page_marks where day = ${day}`,
  ]);
  const reviewed = new Map(reviews.map((r) => [r.outlet_id as string, r]));
  const pos = (o: string, t: string) => marks.find((m) => m.outlet_id === o && m.topic_id === t)?.position ?? "";
  const stories = ed?.stories ?? [];

  return (
    <main className="mx-auto max-w-6xl px-4 pt-10">
      <p className="label text-disputed">Back-office · solo editores</p>
      <h1 className="display mt-4 text-6xl sm:text-8xl">Portadas</h1>
      <AdminNav active="/admin/portadas" />
      <p className="mt-6 max-w-2xl text-muted">
        Abre la portada de cada medio, mira qué temas del día lleva y marca su posición (1 = apertura). Déjalo vacío si no lo lleva.
        Son unos 10–15 minutos al día y hace que el recuento “La cuentan X de Y medios” incluya a todos.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
          <div className="h-full bg-accent" style={{ width: `${(reviewed.size / manual.length) * 100}%` }} />
        </div>
        <span className="label text-[10px] text-muted">{reviewed.size}/{manual.length} portadas revisadas hoy</span>
      </div>

      {!stories.length && <p className="mt-10 text-muted">Aún no hay edición de hoy.</p>}

      <div className="mt-8 space-y-4">
        {manual.map((o) => {
          const r = reviewed.get(o.id);
          return (
            <details key={o.id} className={`rounded-3xl border p-5 ${r ? "border-accent/40" : "border-line bg-surface"}`} open={!r}>
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
                <span className="display text-3xl">{o.name}</span>
                <span className={`label text-[10px] ${r ? "text-accent" : "text-disputed"}`}>
                  {r ? `✓ Revisada ${new Date(r.reviewed_at).toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit" })}` : "Pendiente"}
                </span>
              </summary>
              <a href={o.url} target="_blank" rel="noreferrer noopener" className="label mt-4 inline-block rounded-full border border-line px-4 py-2 text-[10px] hover:border-accent">
                Abrir portada de {o.name} ↗
              </a>
              <form action={saveFrontPage} className="mt-5">
                <input type="hidden" name="outletId" value={o.id} />
                <ul className="divide-y divide-line border-y border-line">
                  {stories.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 py-3">
                      <span className="numeral w-8 text-2xl text-muted">{s.rank}</span>
                      <span className="flex-1 text-[15px] leading-snug">{s.headline}</span>
                      <input name={`pos:${s.id}`} defaultValue={pos(o.id, s.id)} inputMode="numeric" placeholder="—" aria-label={`Posición en ${o.name}`}
                        className="h-11 w-16 rounded-xl border border-line bg-bg text-center text-lg outline-none focus:border-accent" />
                    </li>
                  ))}
                </ul>
                <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_5rem]">
                  <input name="extraHeadline" placeholder="¿Abre con algo que no está en la lista? Descríbelo" className="h-11 rounded-xl border border-line bg-bg px-4 text-sm outline-none focus:border-accent" />
                  <input name="extraUrl" type="url" placeholder="Enlace (opcional)" className="h-11 rounded-xl border border-line bg-bg px-4 text-sm outline-none focus:border-accent" />
                  <input name="extraPosition" inputMode="numeric" placeholder="Pos." className="h-11 rounded-xl border border-line bg-bg px-3 text-center text-sm outline-none focus:border-accent" />
                </div>
                <button className="label mt-4 h-11 w-full rounded-full bg-accent font-semibold text-bg sm:w-auto sm:px-8">Guardar portada de {o.name}</button>
              </form>
            </details>
          );
        })}
      </div>
    </main>
  );
}
