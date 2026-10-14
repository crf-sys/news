import { Suspense } from "react";
import { AdminNav } from "@/components/AdminNav";
import { sql } from "@/lib/db";
import { VOICE_KIND_LABEL } from "@/lib/sources";
import type { VoiceKind } from "@/lib/types";
import { reviewProposal } from "./actions";

export default function Propuestas() {
  return (
    <main className="mx-auto max-w-6xl px-4 pt-10">
      <p className="label text-disputed">Back-office · solo editores</p>
      <h1 className="display mt-4 text-6xl sm:text-8xl">Propuestas</h1>
      <AdminNav active="/admin/propuestas" />
      <p className="mt-6 max-w-2xl text-muted">Voces propuestas por los lectores. Criterios: alcance demostrable, actividad reciente y que aporte una perspectiva que falte en el panel.</p>
      <Suspense fallback={<p className="label mt-8 text-muted">Cargando…</p>}><List /></Suspense>
    </main>
  );
}

async function List() {
  const rows = (await sql`select id, name, url, kind, reason, status, review_note, created_at, (email is not null) as has_email from voice_proposals order by status = 'pendiente' desc, created_at desc limit 200`) as
    { id: string; name: string; url: string | null; kind: VoiceKind; reason: string; status: string; review_note: string | null; created_at: string; has_email: boolean }[];
  if (!rows.length) return <p className="mt-10 text-muted">Aún no hay propuestas.</p>;
  return (
    <ul className="mt-8 space-y-3">
      {rows.map((p) => (
        <li key={p.id} className={`rounded-3xl border p-5 ${p.status === "pendiente" ? "border-line bg-surface" : "border-line opacity-60"}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="display text-3xl">{p.name}</p>
            <span className={`label text-[9px] ${p.status === "aceptada" ? "text-accent" : p.status === "descartada" ? "text-muted" : "text-disputed"}`}>{p.status}</span>
          </div>
          <p className="label mt-1 text-[9px] text-muted">
            {VOICE_KIND_LABEL[p.kind]} · {new Date(p.created_at).toLocaleDateString("es-ES")} {p.has_email && "· quiere aviso"}
            {p.url && <> · <a href={p.url} target="_blank" rel="noreferrer" className="underline">enlace ↗</a></>}
          </p>
          <p className="mt-3">{p.reason}</p>
          {p.review_note && <p className="mt-2 text-sm text-muted">Nota: {p.review_note}</p>}
          {p.status === "pendiente" && (
            <form action={reviewProposal} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input type="hidden" name="id" value={p.id} />
              <input name="note" placeholder="Nota de revisión (obligatoria si se descarta)" className="h-11 flex-1 rounded-full border border-line bg-bg px-4 text-sm outline-none focus:border-accent" />
              <button name="decision" value="aceptada" className="label h-11 rounded-full bg-accent px-5 font-semibold text-bg">Aceptar</button>
              <button name="decision" value="descartada" className="label h-11 rounded-full border border-line px-5">Descartar</button>
            </form>
          )}
        </li>
      ))}
    </ul>
  );
}
