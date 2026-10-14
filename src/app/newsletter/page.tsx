import { Suspense } from "react";
import Link from "next/link";
import { subscribe } from "./actions";
import { latestEdition } from "@/lib/editions";
import { ACTIVE_REGIONS } from "@/lib/regions";

export default function Newsletter({ searchParams }: PageProps<"/newsletter">) {
  return (
    <main className="grain mx-auto max-w-6xl px-4 pt-10 sm:pt-16">
      <p className="label text-accent">Registro gratuito</p>
      <h1 className="display mt-4 text-[18vw] leading-[0.85] sm:text-[10rem]">07:00<span className="text-accent">.</span></h1>
      <p className="mt-6 max-w-xl text-xl text-muted">
        Regístrate y recibe cada mañana <span className="text-fg">las 10 noticias del día</span>, con los hechos separados de la opinión. Cinco minutos. Gratis.
      </p>
      <ol className="mt-8 grid max-w-3xl gap-2 sm:grid-cols-3">
        {[["1", "Deja tu email"], ["2", "Confírmalo con un clic"], ["3", "Cada día a las 07:00 en tu correo"]].map(([n, t]) => (
          <li key={n} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
            <span className="numeral text-4xl text-accent">{n}</span><span>{t}</span>
          </li>
        ))}
      </ol>

      <Suspense fallback={<div className="mt-10 h-40 max-w-xl rounded-3xl bg-surface" />}>
        <SignupForm searchParams={searchParams} />
      </Suspense>
      <Suspense><Preview /></Suspense>
    </main>
  );
}

const MESSAGES: Record<string, [string, "ok" | "error"]> = {
  "ok:1": ["¡Casi listo! Te hemos enviado un email: pulsa el botón para confirmar.", "ok"],
  "ok:ya": ["Ya estabas registrado. Seguirás recibiendo Las 10 de hoy cada mañana.", "ok"],
  "confirmado:1": ["¡Confirmado! Mañana a las 07:00 recibirás tu primer email.", "ok"],
  "baja:1": ["Te hemos dado de baja. No recibirás más emails. Puedes volver cuando quieras.", "ok"],
  "error:email": ["Ese email no parece válido.", "error"],
  "error:consentimiento": ["Para registrarte tienes que aceptar la política de privacidad.", "error"],
  "error:limite": ["Demasiados intentos seguidos. Prueba de nuevo en una hora.", "error"],
  "error:enlace": ["El enlace de confirmación no es válido o ya se usó. Regístrate de nuevo.", "error"],
};

async function SignupForm({ searchParams }: { searchParams: PageProps<"/newsletter">["searchParams"] }) {
  const sp = await searchParams;
  const key = Object.entries(sp).map(([k, v]) => `${k}:${v}`).find((k) => MESSAGES[k]);
  const msg = key ? MESSAGES[key] : null;
  const done = msg?.[1] === "ok";
  return (
    <>
      {msg && <p className={`mt-10 max-w-xl rounded-2xl p-5 text-lg ${done ? "bg-accent/10 text-accent" : "bg-disputed/10 text-disputed"}`}>{msg[0]}</p>}
      {!done && (
        <form action={subscribe} className="mt-10 max-w-xl space-y-4 rounded-3xl border border-line bg-surface p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input name="email" type="email" required autoComplete="email" placeholder="tu@email.com" aria-label="Tu email"
              className="h-14 flex-1 rounded-full border border-line bg-bg px-6 text-lg outline-none focus:border-accent" />
            <select name="region" aria-label="Edición" className="h-14 rounded-full border border-line bg-bg px-5 outline-none focus:border-accent">
              {ACTIVE_REGIONS.map((r) => <option key={r.id} value={r.id}>{r.id === "es" ? "Edición nacional" : r.short}</option>)}
            </select>
          </div>
          <label className="flex items-start gap-3 text-sm text-muted">
            <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-[var(--accent)]" />
            <span>Acepto recibir cada mañana la newsletter de Ágora y el tratamiento de mi email según la <Link href="/privacidad" className="underline">política de privacidad</Link>. Puedo darme de baja en cualquier momento.</span>
          </label>
          <button className="label h-14 w-full rounded-full bg-accent text-sm font-semibold text-bg">Regístrate gratis</button>
        </form>
      )}
    </>
  );
}

async function Preview() {
  const ed = await latestEdition("es");
  if (!ed) return null;
  return (
    <div className="mt-16 max-w-md rounded-3xl border border-line bg-surface p-6">
      <p className="label text-[10px] text-muted">Así fue la de hoy · {ed.date}</p>
      <ol className="mt-4 space-y-3">
        {ed.stories.slice(0, 5).map((s) => (
          <li key={s.id} className="flex gap-3"><span className="numeral text-3xl text-accent">{s.rank}</span><span className="leading-snug">{s.headline}</span></li>
        ))}
      </ol>
      <p className="label mt-4 text-[10px] text-muted">+{Math.max(0, ed.stories.length - 5)} más…</p>
    </div>
  );
}
