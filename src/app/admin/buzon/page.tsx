import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";
import { INBOX, resend } from "@/lib/mail";

// Buzón de las10@agora10.com. Por seguridad NO se renderiza el HTML de los correos (podría traer
// scripts, píxeles de seguimiento o enlaces engañosos): solo texto plano y la lista de enlaces.
export default async function Buzon({ searchParams }: PageProps<"/admin/buzon">) {
  const { id } = await searchParams;
  const { data, error } = await resend.emails.receiving.list({ limit: 50 });
  const selected = typeof id === "string" ? (await resend.emails.receiving.get(id)).data : null;
  const links = selected ? [...new Set([...(selected.html ?? "").matchAll(/href="(https?:[^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&")))] : [];

  return (
    <main className="mx-auto max-w-6xl px-4 pt-10">
      <p className="label text-disputed">Back-office · solo editores</p>
      <h1 className="display mt-4 text-6xl sm:text-8xl">Buzón</h1>
      <AdminNav active="/admin/buzon" />
      <p className="mt-6 max-w-2xl text-muted">
        Correo de <b className="text-fg">{INBOX}</b>. Úsalo para suscribirte a las newsletters de los diarios y confirmar las altas desde aquí.
      </p>
      {error && <p className="mt-6 rounded-xl bg-disputed/10 p-4 text-disputed">No se pudo leer el buzón: {error.message}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <ul className="divide-y divide-line border-y border-line">
          {(data?.data ?? []).map((m) => (
            <li key={m.id}>
              <Link href={`/admin/buzon?id=${m.id}`} className={`block py-3 ${m.id === id ? "text-accent" : "hover:text-accent"}`}>
                <span className="label text-[9px] text-muted">{m.from} · {new Date(m.created_at).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</span><br />
                {m.subject || "(sin asunto)"}
              </Link>
            </li>
          ))}
          {!data?.data.length && !error && <li className="py-6 text-muted">Todavía no ha llegado ningún correo.</li>}
        </ul>

        {selected && (
          <article className="rounded-3xl border border-line bg-surface p-6">
            <p className="label text-[10px] text-muted">{selected.from}</p>
            <h2 className="display mt-2 text-3xl">{selected.subject}</h2>
            {links.length > 0 && (
              <details className="mt-4 rounded-2xl border border-line p-4" open={links.length < 8}>
                <summary className="label cursor-pointer text-[10px] text-muted">Enlaces del correo ({links.length})</summary>
                <ul className="mt-3 space-y-2 text-sm">
                  {links.slice(0, 60).map((l) => (
                    <li key={l} className="truncate"><a href={l} target="_blank" rel="noreferrer noopener" className="underline hover:text-accent">{l}</a></li>
                  ))}
                </ul>
              </details>
            )}
            <pre className="mt-4 max-h-[60vh] overflow-auto whitespace-pre-wrap font-sans text-[15px] text-fg/85">{selected.text ?? "(sin versión de texto)"}</pre>
          </article>
        )}
      </div>
    </main>
  );
}
