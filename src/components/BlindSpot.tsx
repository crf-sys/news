import { spectrumOf } from "@/lib/coverage";
import type { Story } from "@/lib/types";

/** Distintivo "Punto ciego": la noticia solo la cuenta (o la ignora) un lado del espectro. */
export function BlindSpot({ story, big = false }: { story: Story; big?: boolean }) {
  const b = spectrumOf(story).blindSpot;
  if (!b) return null;
  return (
    <span className={`label inline-flex items-center gap-2 rounded-full bg-fg font-semibold text-bg ${big ? "px-4 py-2 text-[11px]" : "px-3 py-1 text-[9px]"}`}
      title="Punto ciego: cobertura desigual entre los lados del espectro">
      <span aria-hidden className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-disputed opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-disputed" />
      </span>
      Punto ciego · {b.label}
    </span>
  );
}
