import type { Story } from "@/lib/types";

/** Resumen compacto de lo que se ha medido de un tema: medios, espectro, verificaciones y confianza. */
export function ObjectivityStrip({ story }: { story: Story }) {
  const o = story.objectivity;
  if (!o) return null;
  const facts = story.claims.filter((c) => c.status === "hecho").length;
  const disputed = story.claims.filter((c) => c.status === "disputado").length;
  const opinions = story.claims.filter((c) => c.status === "opinion").length;
  const unconfirmed = story.claims.filter((c) => c.status === "sin_contrastar").length;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <CoverageCount outlets={o.outlets} total={o.outletsTotal} />
      <span className="label flex items-center gap-1 text-[10px]">
        <i className="h-2 w-2 rounded-full bg-fact" />{facts} hechos
      </span>
      {disputed > 0 && <span className="label flex items-center gap-1 text-[10px]"><i className="h-2 w-2 rounded-full bg-disputed" />{disputed} en disputa</span>}
      {unconfirmed > 0 && <span className="label flex items-center gap-1 text-[10px] text-muted"><i className="h-2 w-2 rounded-full border border-muted" />{unconfirmed} sin contrastar</span>}
      {opinions > 0 && <span className="label flex items-center gap-1 text-[10px]"><i className="h-2 w-2 rounded-full border border-opinion" />{opinions} opiniones</span>}
      {o.verified > 0 && <span className="label text-[10px] text-accent">✓ {o.verified} en fuente oficial</span>}
      <ConfidenceDot level={o.confidence} />
    </div>
  );
}

export function ConfidenceDot({ level }: { level: "alta" | "media" | "baja" }) {
  const bars = level === "alta" ? 3 : level === "media" ? 2 : 1;
  return (
    <span className="label flex items-center gap-1.5 text-[10px] text-muted" title="Confianza del informe">
      <span className="flex items-end gap-[2px]">
        {[1, 2, 3].map((i) => <i key={i} className={`w-1 rounded-sm ${i <= bars ? "bg-fg" : "bg-line"}`} style={{ height: 4 + i * 3 }} />)}
      </span>
      confianza {level}
    </span>
  );
}

/** El dato que ordena la portada: cuántos de los medios que leemos cuentan esta noticia. */
export function CoverageCount({ outlets, total, big = false }: { outlets: number; total?: number; big?: boolean }) {
  const t = Math.max(total ?? outlets, outlets);
  return (
    <span className="flex items-center gap-2" title="Número de medios distintos que la cuentan">
      <span className="flex gap-[3px]">
        {Array.from({ length: t }, (_, i) => (
          <i key={i} className={`${big ? "h-5 w-2" : "h-3 w-1.5"} rounded-sm ${i < outlets ? "bg-accent" : "bg-line"}`} />
        ))}
      </span>
      <span className={`label ${big ? "text-xs" : "text-[10px]"} text-fg`}>
        La cuentan <b>{outlets}</b>{total ? ` de ${t}` : ""} medios
      </span>
    </span>
  );
}
