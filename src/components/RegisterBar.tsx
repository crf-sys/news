"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Barra fija de registro, sobre todo pensada para móvil. Se puede cerrar y no vuelve a salir en 7 días.
const KEY = "agora_register_bar";

export function RegisterBar() {
  const path = usePathname();
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      const closed = Number(localStorage.getItem(KEY) ?? 0);
      setShow(Date.now() - closed > 7 * 86_400_000);
    } catch {
      setShow(true);
    }
  }, []);
  if (!show || path.startsWith("/newsletter") || path.startsWith("/admin") || path.startsWith("/sign-in")) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-xl items-center gap-3 rounded-full border border-accent/40 bg-bg/90 p-2 pl-5 shadow-2xl backdrop-blur-xl sm:bottom-6">
      <p className="flex-1 text-sm leading-tight"><b>Las 10 de hoy</b> <span className="text-muted">en tu correo a las 07:00</span></p>
      <Link href="/newsletter" className="label shrink-0 rounded-full bg-accent px-5 py-3 font-semibold text-bg">Regístrate gratis</Link>
      <button aria-label="Cerrar" onClick={() => { try { localStorage.setItem(KEY, String(Date.now())); } catch {} setShow(false); }} className="px-2 text-muted">✕</button>
    </div>
  );
}
