import type { ClaimStatus } from "@/lib/types";

const STYLE: Record<ClaimStatus, { label: string; cls: string }> = {
  hecho: { label: "Hecho", cls: "bg-fact text-bg" },
  disputado: { label: "En disputa", cls: "bg-disputed text-bg" },
  sin_contrastar: { label: "Sin contrastar", cls: "border border-muted text-muted" },
  opinion: { label: "Opinión", cls: "border border-opinion text-opinion" },
};

export function ClaimBadge({ status }: { status: ClaimStatus }) {
  const s = STYLE[status];
  return <span className={`label inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${s.cls}`}>{s.label}</span>;
}
