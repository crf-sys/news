import Link from "next/link";
import { LEAN_LABEL, VOICE_KIND_LABEL, affiliation, COLUMNISTS, OUTLETS } from "@/lib/sources";
import type { Lean, Story } from "@/lib/types";

/**
 * "Otras visiones": todas las voces del panel que han opinado sobre un tema,
 * colocadas en el espectro. En móvil es un carrusel con snap; en escritorio, 5 columnas.
 * `highlight` marca la voz desde la que se llega (p.ej. desde su ficha).
 */
export function OtherViews({ story, highlight }: { story: Story; highlight?: string }) {
  const lanes: Lean[] = [-2, -1, 0, 1, 2];
  // Voz del panel → su posición medida. Autor externo → línea editorial de su medio (no una etiqueta personal).
  const views = story.opinions.map((o, i) => {
    const c = COLUMNISTS.find((x) => x.id === o.columnistId);
    const out = OUTLETS.find((x) => x.id === (c?.outletId ?? o.outletId));
    return {
      key: o.columnistId ?? `${o.author}-${i}`,
      take: o.take,
      url: o.url,
      name: c?.name ?? o.author ?? "Autor",
      href: c ? `/columnista/${c.id}` : undefined,
      meta: c ? `${VOICE_KIND_LABEL[c.kind]} · ${affiliation(c)}` : `${out?.name ?? ""} · posición según línea del medio`,
      lean: (c?.lean ?? out?.lean ?? 0) as Lean,
      highlighted: !!o.columnistId && o.columnistId === highlight,
    };
  });
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
      {lanes.map((lean) => {
        const inLane = views.filter((v) => v.lean === lean);
        return (
          <div key={lean} className="w-[78%] shrink-0 snap-center sm:w-auto">
            <div className="label mb-2 flex items-center justify-between text-[10px] text-muted">
              <span>{LEAN_LABEL[lean]}</span><span>{inLane.length}</span>
            </div>
            <div className="space-y-2">
              {inLane.length === 0 && <div className="rounded-2xl border border-dashed border-line p-4 text-sm text-muted">Sin voces del panel</div>}
              {inLane.map((v) => (
                <div key={v.key} className={`rounded-2xl border p-4 ${v.highlighted ? "border-accent bg-accent/5" : "border-line bg-surface"}`}>
                  {v.href ? <Link href={v.href} className="font-semibold hover:text-accent">{v.name}</Link> : <span className="font-semibold">{v.name}</span>}
                  <p className="label mt-1 text-[9px] text-muted">{v.meta}</p>
                  <p className="mt-3 italic leading-snug text-fg/85">“{v.take}”</p>
                  <a href={v.url} className="label mt-3 inline-block text-[9px] text-opinion">Leer original ↗</a>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
