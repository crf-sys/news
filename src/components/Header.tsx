import Link from "next/link";

const NAV = [
  { href: "/", label: "Hoy" },
  { href: "/columnistas", label: "Voces" },
  { href: "/proponer", label: "Propón" },
  { href: "/fuentes", label: "Fuentes" },
  { href: "/metodologia", label: "Método" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="display text-3xl">
          Ágora<span className="text-accent">.</span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="label hidden rounded-full px-3 py-2 text-muted hover:text-fg sm:block">
              {n.label}
            </Link>
          ))}
          <Link href="/newsletter" className="label rounded-full bg-accent px-4 py-2 font-semibold text-bg">
            07:00 ✉
          </Link>
        </nav>
      </div>
      {/* Navegación móvil: tira deslizable bajo la cabecera */}
      <nav className="no-scrollbar flex gap-1 overflow-x-auto border-t border-line px-4 py-2 sm:hidden">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="label shrink-0 rounded-full border border-line px-3 py-1.5 text-muted">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
