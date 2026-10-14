import { OUTLETS, outlet } from "@/lib/sources";
import type { Story } from "@/lib/types";

/** 10 casillas: cuántos medios del panel llevan el tema. */
export function CoverageMeter({ story }: { story: Story }) {
  const ids = new Set(story.coverage.map((c) => c.outletId));
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-[3px]">
        {OUTLETS.map((o) => (
          <span key={o.id} title={o.name} className={`h-3 w-1.5 rounded-sm ${ids.has(o.id) ? "bg-accent" : "bg-line"}`} />
        ))}
      </div>
      <span className="label text-muted">{ids.size}/10 medios</span>
    </div>
  );
}

/** Dónde se sitúan, en el eje ideológico, los medios que cubren el tema. Sin colores de partido. */
export function SpectrumStrip({ outletIds, big = false }: { outletIds: string[]; big?: boolean }) {
  const buckets = [-2, -1, 0, 1, 2].map((lean) => outletIds.filter((id) => outlet(id).lean === lean).length);
  const max = Math.max(1, ...buckets);
  return (
    <div className={big ? "w-full" : "w-40"}>
      <div className={`flex items-end gap-1 ${big ? "h-16" : "h-6"}`}>
        {buckets.map((n, i) => (
          <div key={i} className="flex-1 rounded-t-sm bg-fg/80" style={{ height: `${(n / max) * 100}%`, opacity: n ? 1 : 0.12, minHeight: 2 }} />
        ))}
      </div>
      <div className="label mt-1 flex justify-between text-[9px] text-muted">
        <span>Izq</span><span>Centro</span><span>Der</span>
      </div>
    </div>
  );
}
