import { Suspense } from "react";
import Link from "next/link";
import { propose } from "./actions";
import { VOICE_KIND_LABEL } from "@/lib/sources";

const field = "w-full rounded-xl border border-line bg-bg px-4 outline-none focus:border-accent";

// Referencias que seguimos para construir el método (enlazadas para que cualquiera pueda comprobarlas).
const REFERENCES = [
  { name: "Código de principios de la IFCN", by: "International Fact-Checking Network (Poynter)", what: "No partidismo, transparencia de fuentes, de financiación y de método, y política de correcciones abierta.", url: "https://ifcncodeofprinciples.poynter.org/" },
  { name: "Código de Prácticas sobre Desinformación", by: "Comisión Europea", what: "Marco europeo de compromisos contra la desinformación, reforzado en 2022 y ligado a la Ley de Servicios Digitales.", url: "https://digital-strategy.ec.europa.eu/es/policies/code-practice-disinformation" },
  { name: "Reglamento Europeo sobre la Libertad de los Medios (EMFA)", by: "Unión Europea", what: "Independencia editorial y transparencia sobre la propiedad de los medios.", url: "https://digital-strategy.ec.europa.eu/es/policies/media-freedom-act" },
  { name: "Journalism Trust Initiative (ISO CWA 17493)", by: "Reporteros Sin Fronteras", what: "Estándar para certificar procesos periodísticos fiables y transparentes.", url: "https://www.journalismtrustinitiative.org/" },
  { name: "Digital News Report España", by: "Reuters Institute · Universidad de Navarra", what: "Confianza, consumo y autoubicación ideológica de las audiencias de cada medio. Base para situar a los medios.", url: "https://www.digitalnewsreport.es/" },
  { name: "Media Bias Chart (metodología)", by: "Ad Fontes Media", what: "Método público de evaluación de sesgo y fiabilidad con paneles equilibrados de analistas.", url: "https://adfontesmedia.com/how-ad-fontes-ranks-news-sources/" },
  { name: "Verificadores españoles de la red IFCN", by: "Newtral · Maldita.es · EFE Verifica", what: "Los consultamos cuando una afirmación ya ha sido verificada.", url: "https://www.newtral.es/" },
  { name: "Fuentes primarias oficiales", by: "BOE · Congreso · INE · CIS · CGPJ · Banco de España · AIReF", what: "Donde comprobamos cifras, normas, votaciones y resoluciones antes de dar algo por hecho.", url: "https://www.boe.es/" },
];

const PRINCIPLES = [
  ["Separar", "Cada afirmación lleva su etiqueta: hecho, disputado u opinión."],
  ["Verificar", "Ante la duda, vamos a la fuente primaria. Si no se puede comprobar, lo decimos."],
  ["Citar", "Todo enlaza al medio o documento original. Sin fuente, no se publica."],
  ["Medir, no etiquetar", "La posición de medios y voces se calcula con datos y se puede auditar."],
];

export default function Proponer({ searchParams }: PageProps<"/proponer">) {
  return (
    <main className="grain">
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:pt-16">
        <p className="label text-accent">Manifiesto</p>
        <h1 className="display mt-4 max-w-5xl text-6xl sm:text-[7.5rem]">
          Información contra la <span className="italic text-accent">desinformación.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-xl text-muted">
          Estamos construyendo un medio que no compite con los demás: los lee todos, separa lo que es hecho de lo que es opinión,
          comprueba lo dudoso en las fuentes originales y te enseña cómo cuenta cada uno lo que pasa. Sin línea editorial. Con método.
        </p>
        <div className="mt-12 grid gap-3 sm:grid-cols-4">
          {PRINCIPLES.map(([t, d], i) => (
            <div key={t} className="rounded-3xl border border-line bg-surface p-6">
              <span className="numeral text-5xl text-accent">{i + 1}</span>
              <p className="display mt-3 text-3xl">{t}</p>
              <p className="mt-2 text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="label text-muted">Participa</p>
          <h2 className="display mt-2 text-5xl sm:text-7xl">Propón una voz</h2>
          <p className="mt-4 text-lg text-muted">
            ¿Echas en falta a un columnista, periodista, académico o creador que influye en la conversación pública?
            Propónlo. El equipo revisa cada propuesta con criterios públicos: alcance demostrable, actividad reciente y que
            aporte una perspectiva que falte en el <Link href="/columnistas" className="underline">panel actual</Link>.
            Da igual su ideología: lo que importa es que se le lea.
          </p>
          <Suspense><Flash searchParams={searchParams} /></Suspense>
        </div>

        <form action={propose} className="space-y-4 rounded-3xl border border-line bg-surface p-6">
          <Field label="Nombre de la voz"><input name="name" required maxLength={120} className={`${field} h-12`} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo">
              <select name="kind" className={`${field} h-12`}>
                {Object.entries(VOICE_KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Dónde publica (enlace)"><input name="url" type="url" placeholder="https://…" className={`${field} h-12`} /></Field>
          </div>
          <Field label="¿Por qué debería estar? (mín. 20 caracteres)">
            <textarea name="reason" required minLength={20} rows={4} className={`${field} py-3`} placeholder="Audiencia, influencia, qué perspectiva aporta…" />
          </Field>
          <Field label="Tu email (opcional, para avisarte)"><input name="email" type="email" className={`${field} h-12`} /></Field>
          <label className="flex items-start gap-3 text-sm text-muted">
            <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-[var(--accent)]" />
            <span>Si dejo mi email, acepto que Ágora lo use solo para informarme sobre esta propuesta, según la <Link href="/privacidad" className="underline">política de privacidad</Link>.</span>
          </label>
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <button className="label h-12 w-full rounded-full bg-accent font-semibold text-bg">Enviar propuesta</button>
        </form>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4">
        <p className="label text-muted">En qué nos basamos</p>
        <h2 className="display mt-2 text-5xl sm:text-7xl">Referencias que seguimos</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted">Estándares internacionales y fuentes públicas que guían cómo analizamos. Si crees que falta alguna, propónla también.</p>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {REFERENCES.map((r) => (
            <li key={r.name}>
              <a href={r.url} target="_blank" rel="noreferrer" className="group block h-full rounded-3xl border border-line p-6 hover:border-accent">
                <p className="label text-[10px] text-muted">{r.by}</p>
                <p className="display mt-2 text-3xl group-hover:text-accent">{r.name} ↗</p>
                <p className="mt-2 text-muted">{r.what}</p>
              </a>
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

async function Flash({ searchParams }: { searchParams: PageProps<"/proponer">["searchParams"] }) {
  const { ok, error } = await searchParams;
  if (ok) return <p className="mt-6 rounded-xl bg-accent/10 p-4 text-accent">Gracias. Revisaremos la propuesta con los criterios públicos del panel.</p>;
  if (error === "limite") return <p className="mt-6 rounded-xl bg-disputed/10 p-4 text-disputed">Has enviado varias propuestas seguidas. Inténtalo de nuevo en una hora.</p>;
  if (error === "email") return <p className="mt-6 rounded-xl bg-disputed/10 p-4 text-disputed">Si dejas tu email, debe ser válido y tienes que aceptar la política de privacidad.</p>;
  if (error) return <p className="mt-6 rounded-xl bg-disputed/10 p-4 text-disputed">Faltan datos: nombre y un motivo de al menos 20 caracteres.</p>;
  return null;
}
