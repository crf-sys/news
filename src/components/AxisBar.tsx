import type { IdeologyAxis } from "@/lib/types";

/** Barra de un eje: posición + banda de incertidumbre. Ancho de la banda = 1 - confianza. */
export function AxisBar({ axis }: { axis: IdeologyAxis }) {
  const insufficient = axis.evidence < 8;
  const pos = ((axis.value + 1) / 2) * 100;
  const band = (1 - axis.confidence) * 50;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="display text-2xl">{axis.label}</span>
        <span className="label text-[10px] text-muted">
          {insufficient ? "Datos insuficientes" : `${axis.evidence} textos · confianza ${Math.round(axis.confidence * 100)}%`}
        </span>
      </div>
      <div className="relative mt-3 h-10 rounded-full border border-line bg-surface">
        <div className="absolute inset-y-0 left-1/2 w-px bg-line" />
        {!insufficient && (
          <>
            <div className="absolute inset-y-2 rounded-full bg-accent/15" style={{ left: `${Math.max(0, pos - band)}%`, width: `${Math.min(100, band * 2)}%` }} />
            <div className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_24px_rgba(228,255,58,0.6)]" style={{ left: `${pos}%` }} />
          </>
        )}
      </div>
      <div className="label mt-2 flex justify-between text-[10px] text-muted">
        <span>{axis.poles[0]}</span><span>{axis.poles[1]}</span>
      </div>
    </div>
  );
}
