import { outlet } from "@/lib/sources";
import type { Claim } from "@/lib/types";

/** Nombre de cada medio enlazado a su pieza. Es el enlace el que dice quién lo cuenta. */
export function SourceChips({ sources, outletIds }: { sources?: { outletId: string; url: string }[]; outletIds?: string[] }) {
  const items = sources?.length ? sources : (outletIds ?? []).map((outletId) => ({ outletId, url: "" }));
  if (!items.length) return null;
  return (
    <span className="inline-flex flex-wrap gap-1.5 align-middle">
      {items.map((s) =>
        s.url ? (
          <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="label rounded-full border border-line px-2.5 py-1 text-[9px] text-muted hover:border-accent hover:text-accent">
            {outlet(s.outletId)?.name ?? s.outletId} ↗
          </a>
        ) : (
          <span key={s.outletId} className="label rounded-full border border-line px-2.5 py-1 text-[9px] text-muted">{outlet(s.outletId)?.name ?? s.outletId}</span>
        ),
      )}
    </span>
  );
}

/** Versiones de una afirmación disputada: "Unos dicen… / Otros dicen…", cada una con sus enlaces. */
export function Versions({ claim, compact = false }: { claim: Claim; compact?: boolean }) {
  if (!claim.versions?.length) return null;
  const lead = (i: number) => (i === 0 ? "Unos dicen" : i === 1 ? "Otros dicen" : "También se dice");
  return (
    <ul className={compact ? "mt-2 space-y-2" : "mt-4 space-y-3"}>
      {claim.versions.map((v, i) => (
        <li key={i} className={`border-l-2 border-disputed pl-3 ${compact ? "text-[15px]" : "text-lg"} leading-snug`}>
          <span className="label mr-2 text-[10px] text-disputed">{lead(i)}:</span>
          {v.text} <SourceChips sources={v.sources} />
        </li>
      ))}
    </ul>
  );
}
