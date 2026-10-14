import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/Header";
import { CookieConsent } from "@/components/CookieConsent";
import { RegisterBar } from "@/components/RegisterBar";
import "./globals.css";

const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const sans = Inter_Tight({ variable: "--font-inter", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ágora — Las 10 de hoy, sin ruido",
  description: "Las 10 noticias más importantes del día según los principales medios, separando hechos de opinión.",
};

export const viewport: Viewport = { themeColor: "#0b0b0c" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable} ${mono.variable} antialiased`}>
      <body className="min-h-dvh font-sans">
        <ClerkProvider>
        <Header />
        {children}
        <footer className="mx-auto mt-24 max-w-6xl border-t border-line px-4 py-16">
          <p className="display text-3xl">Ágora<span className="text-accent">.</span></p>
          <p className="mt-2 max-w-md text-muted">Información contra la desinformación. Cada afirmación enlaza a sus fuentes.</p>
          <nav className="label mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[10px] text-muted">
            <a href="/metodologia" className="hover:text-fg">Método</a>
            <a href="/fuentes" className="hover:text-fg">Fuentes</a>
            <a href="/proponer" className="hover:text-fg">Propón una voz</a>
            <a href="/aviso-legal" className="hover:text-fg">Aviso legal</a>
            <a href="/privacidad" className="hover:text-fg">Privacidad</a>
            <a href="/cookies" className="hover:text-fg">Cookies</a>
          </nav>
        </footer>
        <Suspense><RegisterBar /></Suspense>
        <CookieConsent />
        </ClerkProvider>
      </body>
    </html>
  );
}
