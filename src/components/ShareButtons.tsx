"use client";

import { useState } from "react";

/** Compartir: menú nativo del móvil si existe; si no, WhatsApp, X y copiar enlace. */
export function ShareButtons({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://agora10.com${path}`;
  const text = `${title} · vía Ágora`;
  const native = async () => {
    try { await navigator.share({ title, text, url }); } catch {}
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
  const btn = "label rounded-full border border-line px-4 py-2 text-[10px] hover:border-accent hover:text-accent";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={native} className={`${btn} border-accent bg-accent font-semibold text-bg sm:hidden`}>Compartir</button>
      <a className={btn} target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}>WhatsApp</a>
      <a className={btn} target="_blank" rel="noreferrer" href={`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}>X</a>
      <button onClick={copy} className={btn}>{copied ? "¡Copiado!" : "Copiar enlace"}</button>
    </div>
  );
}
