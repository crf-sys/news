import { AdminNav } from "@/components/AdminNav";
import { sql } from "@/lib/db";
import { ALL_OUTLETS } from "@/lib/sources";
import { activateLicense, revokeLicense } from "./actions";

const field = "h-11 w-full rounded-xl border border-line bg-bg px-4 text-sm outline-none focus:border-accent";

export default async function Licencias({ searchParams }: PageProps<"/admin/licencias">) {
  const sp = await searchParams;
  const reserved = ALL_OUTLETS.filter((o) => o.access === "licencia");
  const rows = (await sql`select * from outlet_licenses order by activated_at desc`) as {
    id: string; outlet_id: string; licensor: string; reference: string; scope: string; valid_from: string; valid_until: string | null;
    document_url: string | null; activated_by: string; activated_at: string; revoked_at: string | null;
  }[];
  const active = (id: string) => rows.find((r) => r.outlet_id === id && !r.revoked_at && (!r.valid_until || new Date(r.valid_until) >= new Date()));
  const name = (id: string) => ALL_OUTLETS.find((o) => o.id === id)?.name ?? id;

  return (
    <main className="mx-auto max-w-6xl px-4 pt-10">
      <p className="label text-disputed">Back-office · solo editores</p>
      <h1 className="display mt-4 text-6xl sm:text-8xl">Licencias</h1>
      <AdminNav active="/admin/licencias" />
      <p className="mt-6 max-w-2xl text-muted">
        Activa a mano un medio que se reserva el análisis automático <b className="text-fg">cuando tengas su licencia o autorización por escrito</b>.
        Desde ese momento sus piezas entran en la lectura y el análisis automáticos. Cada activación queda registrada con su referencia y se puede revocar al instante.
      </p>
      {sp.ok && <p className="mt-6 rounded-xl bg-accent/10 p-4 text-accent">Licencia registrada. El medio se incluye desde la próxima lectura.</p>}
      {sp.revocada && <p className="mt-6 rounded-xl bg-line p-4">Licencia revocada. El medio deja de leerse automáticamente.</p>}
      {sp.error && <p className="mt-6 rounded-xl bg-disputed/10 p-4 text-disputed">{sp.error === "declaracion" ? "Falta confirmar la declaración de licencia." : "Faltan datos: medio, quién la concede, referencia, alcance y fecha de inicio."}</p>}

      <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reserved.map((o) => {
          const lic = active(o.id);
          return (
            <div key={o.id} className={`rounded-3xl border p-5 ${lic ? "border-accent/50" : "border-line bg-surface"}`}>
              <p className="display text-3xl">{o.name}</p>
              <p className={`label mt-2 text-[10px] ${lic ? "text-accent" : "text-muted"}`}>{lic ? `Activo · ${lic.scope === "texto_completo" ? "texto completo" : "solo titulares"}` : "No activado"}</p>
              {lic && <p className="mt-2 text-sm text-muted">{lic.licensor} · {lic.reference}</p>}
            </div>
          );
        })}
      </section>

      <form action={activateLicense} className="mt-10 grid gap-4 rounded-3xl border border-line bg-surface p-6 sm:grid-cols-2">
        <h2 className="display text-3xl sm:col-span-2">Activar un medio</h2>
        <Field label="Medio">
          <select name="outletId" className={field}>{reserved.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
        </Field>
        <Field label="Alcance">
          <select name="scope" className={field}>
            <option value="titulares">Solo titulares, enlace y posición en portada</option>
            <option value="texto_completo">Texto completo</option>
          </select>
        </Field>
        <Field label="Quién la concede"><input name="licensor" required placeholder="Editor, CEDRO, dictamen jurídico de…" className={field} /></Field>
        <Field label="Referencia"><input name="reference" required placeholder="Nº de contrato, fecha del dictamen, email…" className={field} /></Field>
        <Field label="Válida desde"><input name="validFrom" type="date" required className={field} /></Field>
        <Field label="Válida hasta (opcional)"><input name="validUntil" type="date" className={field} /></Field>
        <Field label="Documento (enlace, opcional)"><input name="documentUrl" type="url" placeholder="https://…" className={field} /></Field>
        <label className="flex items-start gap-3 self-end text-sm text-muted">
          <input type="checkbox" name="declaration" className="mt-1 h-4 w-4 accent-[var(--accent)]" />
          Declaro que Ágora dispone de licencia o autorización del editor, o de un dictamen jurídico, que avala el uso indicado.
        </label>
        <button className="label h-12 rounded-full bg-accent font-semibold text-bg sm:col-span-2">Registrar licencia y activar</button>
      </form>

      {rows.length > 0 && (
        <section className="mt-12">
          <h2 className="display text-3xl">Historial</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{name(r.outlet_id)} <span className="font-normal text-muted">· {r.scope === "texto_completo" ? "texto completo" : "solo titulares"}</span></p>
                  <p className="text-sm text-muted">
                    {r.licensor} · {r.reference} · desde {new Date(r.valid_from).toLocaleDateString("es-ES")}{r.valid_until ? ` hasta ${new Date(r.valid_until).toLocaleDateString("es-ES")}` : ""} · activada por {r.activated_by}
                    {r.document_url && <> · <a href={r.document_url} target="_blank" rel="noreferrer" className="underline">documento</a></>}
                  </p>
                </div>
                {r.revoked_at ? (
                  <span className="label text-[10px] text-muted">Revocada {new Date(r.revoked_at).toLocaleDateString("es-ES")}</span>
                ) : (
                  <form action={revokeLicense}><input type="hidden" name="id" value={r.id} /><button className="label rounded-full border border-line px-4 py-2 text-[10px]">Revocar</button></form>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="label mb-1.5 block text-[10px] text-muted">{label}</span>{children}</label>;
}
