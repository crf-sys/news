import { Suspense } from "react";
import { subscribe } from "./actions";
import { TODAY } from "@/lib/mock";

export default function Newsletter({ searchParams }: PageProps<"/newsletter">) {
  return (
    <main className="grain mx-auto max-w-6xl px-4 pt-10 sm:pt-16">
      <p className="label text-accent">Newsletter diaria</p>
      <h1 className="display mt-4 text-[18vw] leading-[0.85] sm:text-[10rem]">07:00<span className="text-accent">.</span></h1>
      <p className="mt-6 max-w-xl text-xl text-muted">Cada mañana, las 10 noticias que importan, con lo que es hecho y lo que es opinión bien separado. Cinco minutos de lectura.</p>

      <Suspense fallback={<div className="mt-10 h-14 max-w-xl rounded-full bg-surface" />}>
        <SignupForm searchParams={searchParams} />
      </Suspense>

      {/* Vista previa del email */}
      <div className="mt-16 max-w-md rounded-3xl border border-line bg-surface p-6">
        <p className="label text-[10px] text-muted">Vista previa · {TODAY.date}</p>
        <ol className="mt-4 space-y-3">
          {TODAY.stories.slice(0, 5).map((s) => (
            <li key={s.id} className="flex gap-3"><span className="numeral text-3xl text-accent">{s.rank}</span><span className="leading-snug">{s.headline}</span></li>
          ))}
        </ol>
        <p className="label mt-4 text-[10px] text-muted">+5 más…</p>
      </div>
    </main>
  );
}

async function SignupForm({ searchParams }: { searchParams: PageProps<"/newsletter">["searchParams"] }) {
  const { ok, error } = await searchParams;
  return (
    <>
      {ok ? (
        <p className="display mt-10 text-4xl text-accent">Revisa tu correo para confirmar.</p>
      ) : (
        <form action={subscribe} className="mt-10 flex max-w-xl flex-col gap-3 sm:flex-row">
          <input name="email" type="email" required placeholder="tu@email.com"
            className="h-14 flex-1 rounded-full border border-line bg-surface px-6 text-lg outline-none focus:border-accent" />
          <button className="label h-14 rounded-full bg-accent px-8 font-semibold text-bg">Suscribirme</button>
        </form>
      )}
      {error && <p className="mt-3 text-disputed">Ese email no parece válido.</p>}

    </>
  );
}
