import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/Header";
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
        <Header />
        {children}
        <footer className="mx-auto max-w-6xl px-4 py-16 text-muted label border-t border-line mt-24">
          Ágora · Cada afirmación enlaza a sus fuentes · <a href="/metodologia" className="underline">Metodología</a>
        </footer>
      </body>
    </html>
  );
}
