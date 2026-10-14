import Link from "next/link";

const TABS = [
  ["/admin/portadas", "Portadas"],
  ["/admin", "Voces"],
  ["/admin/editor", "Edición"],
  ["/admin/ingesta", "Ingesta"],
  ["/admin/propuestas", "Propuestas"],
  ["/admin/buzon", "Buzón"],
  ["/admin/licencias", "Licencias"],
] as const;

export function AdminNav({ active }: { active: string }) {
  return (
    <nav className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
      {TABS.map(([href, label]) => (
        <Link key={href} href={href}
          className={`label shrink-0 rounded-full border px-4 py-2 ${href === active ? "border-accent bg-accent text-bg" : "border-line text-muted hover:text-fg"}`}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
