"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Hoy solo hay cookies técnicas (exentas de consentimiento). El aviso informa y deja guardada la
// elección para cuando se active analítica: nada opcional se carga sin "analytics: true".
const KEY = "agora_consent";
type Consent = { analytics: boolean; at: string };

export function readConsent(): Consent | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "null");
  } catch {
    return null;
  }
}

function save(analytics: boolean) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ analytics, at: new Date().toISOString() }));
  } catch {}
  window.dispatchEvent(new Event("agora-consent"));
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(readConsent() === null);
    const reopen = () => setOpen(true);
    window.addEventListener("agora-cookie-settings", reopen);
    return () => window.removeEventListener("agora-cookie-settings", reopen);
  }, []);
  if (!open) return null;
  return (
    <div role="dialog" aria-label="Preferencias de cookies" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-3xl border border-line bg-surface p-5 shadow-2xl sm:bottom-6">
      <p className="display text-2xl">Cookies, las justas</p>
      <p className="mt-2 text-sm text-muted">
        Solo usamos cookies técnicas para que la web funcione y para iniciar sesión. Si algún día añadimos analítica, no se activará sin tu permiso.{" "}
        <Link href="/cookies" className="underline">Política de cookies</Link>
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button onClick={() => { save(false); setOpen(false); }} className="label h-11 flex-1 rounded-full border border-line">Solo necesarias</button>
        <button onClick={() => { save(true); setOpen(false); }} className="label h-11 flex-1 rounded-full bg-accent font-semibold text-bg">Aceptar todas</button>
      </div>
    </div>
  );
}

export function CookieSettingsButton() {
  return (
    <button onClick={() => window.dispatchEvent(new Event("agora-cookie-settings"))} className="label mt-6 rounded-full border border-line px-5 py-3">
      Cambiar mis preferencias
    </button>
  );
}
