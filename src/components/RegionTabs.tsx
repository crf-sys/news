import Link from "next/link";
import { REGIONS } from "@/lib/regions";

/** Selector de edición: nacional + comunidades. Las aún no activas se muestran como "pronto". */
export function RegionTabs({ active }: { active: string }) {
  return (
    <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
      {REGIONS.map((r) =>
        r.active ? (
          <Link key={r.id} href={r.id === "es" ? "/" : `/${r.id}`}
            className={`label shrink-0 rounded-full border px-4 py-2 ${r.id === active ? "border-accent bg-accent font-semibold text-bg" : "border-line text-muted hover:text-fg"}`}>
            {r.short}
          </Link>
        ) : (
          <span key={r.id} className="label shrink-0 rounded-full border border-dashed border-line px-4 py-2 text-muted/50">
            {r.short} · pronto
          </span>
        ),
      )}
    </nav>
  );
}
