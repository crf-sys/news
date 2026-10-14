import Link from "next/link";
import { COLUMNISTS, VOICE_KIND_LABEL, affiliation } from "@/lib/sources";
import { profile } from "@/lib/profiles";

export default function Columnistas() {
  const groups = [
    { title: "Columnistas", items: COLUMNISTS.filter((c) => c.kind === "columnista") },
    { title: "Líderes de opinión", items: COLUMNISTS.filter((c) => c.kind !== "columnista") },
  ];
  return (
    <main className="grain mx-auto max-w-6xl px-4 pt-10 sm:pt-16">
      <p className="label text-accent">El panel de opinión</p>
      <h1 className="display mt-4 text-7xl sm:text-9xl">Voces</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Las voces con más influencia en la conversación política, elegidas por alcance demostrable y sin repetir medio.
        Su posición <b className="text-fg">no se asigna</b>: se mide a partir de lo que escriben, con las pruebas a la vista.
      </p>
      {groups.map((g) => (
        <section key={g.title} className="mt-14">
          <h2 className="display text-4xl sm:text-5xl">{g.title}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {g.items.map((c, i) => {
              const p = profile(c.id);
              return (
                <Link key={c.id} href={`/columnista/${c.id}`} className="group flex items-center gap-5 rounded-3xl border border-line bg-surface p-5 hover:border-accent">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-line display text-3xl group-hover:bg-accent group-hover:text-bg">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="display text-3xl">{c.name}</p>
                    <p className="label mt-1 text-[10px] text-muted">{VOICE_KIND_LABEL[c.kind]} · {affiliation(c)}</p>
                    <p className={`label mt-3 inline-block rounded-full border px-2 py-1 text-[9px] ${p ? "border-accent text-accent" : "border-disputed text-disputed"}`}>
                      {p ? `Ficha medida · ${p.articlesAnalyzed} textos` : "Ficha en calibración"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
