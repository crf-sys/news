import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
const BG = "#0b0b0c", FG = "#f4f2ee", MUTED = "#8d8a85", ACCENT = "#e4ff3a", DISPUTED = "#ffb23e";

const serif = () => readFile(join(process.cwd(), "assets/fonts/InstrumentSerif-Regular.ttf"));

/** Tarjeta para compartir: titular, cobertura y espectro, con la marca de Ágora. */
export async function storyCard(opts: {
  kicker: string; headline: string; outlets: number; total?: number;
  blocs: { izquierda: number; centro: number; derecha: number }; blindSpot?: string | null;
}) {
  const { kicker, headline, outlets, total, blocs, blindSpot } = opts;
  const t = Math.max(total ?? outlets, outlets);
  const max = Math.max(1, blocs.izquierda, blocs.centro, blocs.derecha);
  const size = headline.length > 110 ? 58 : headline.length > 70 ? 68 : 80;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: BG, color: FG, padding: "56px 64px", fontFamily: "Serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 52 }}>Ágora<span style={{ color: ACCENT }}>.</span></div>
          <div style={{ display: "flex", fontFamily: "sans-serif", fontSize: 20, letterSpacing: 4, color: ACCENT, textTransform: "uppercase" }}>{kicker}</div>
        </div>
        {blindSpot && (
          <div style={{ display: "flex", marginTop: 28, alignSelf: "flex-start", background: FG, color: BG, borderRadius: 999, padding: "8px 20px", fontFamily: "sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
            Punto ciego · {blindSpot}
          </div>
        )}
        <div style={{ display: "flex", flex: 1, alignItems: "center", fontSize: size, lineHeight: 1.02, letterSpacing: -1 }}>{headline}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: t }, (_, i) => <div key={i} style={{ width: 14, height: 34, borderRadius: 4, background: i < outlets ? ACCENT : "#2a2a2e" }} />)}
            </div>
            <div style={{ display: "flex", marginTop: 12, fontSize: 24, color: FG }}>La cuentan {outlets}{total ? ` de ${t}` : ""} medios</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontFamily: "sans-serif" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 70 }}>
              {(["izquierda", "centro", "derecha"] as const).map((k) => (
                <div key={k} style={{ width: 54, height: Math.max(4, (blocs[k] / max) * 70), borderRadius: 6, background: blindSpot ? DISPUTED : FG, opacity: blocs[k] ? 0.9 : 0.15 }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8, fontSize: 15, color: MUTED, letterSpacing: 2 }}>
              <span style={{ width: 54, display: "flex", justifyContent: "center" }}>IZQ</span>
              <span style={{ width: 54, display: "flex", justifyContent: "center" }}>CEN</span>
              <span style={{ width: 54, display: "flex", justifyContent: "center" }}>DER</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: "Serif", data: await serif(), style: "normal", weight: 400 }] },
  );
}

/** Tarjeta genérica de la marca (portada, páginas sin noticia). */
export async function brandCard(title: string, subtitle: string) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: BG, color: FG, padding: "64px", fontFamily: "Serif" }}>
        <div style={{ display: "flex", fontSize: 56 }}>Ágora<span style={{ color: ACCENT }}>.</span></div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 118, lineHeight: 0.95, letterSpacing: -2 }}>{title}</div>
          <div style={{ display: "flex", marginTop: 24, fontFamily: "sans-serif", fontSize: 30, color: MUTED }}>{subtitle}</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: "Serif", data: await serif(), style: "normal", weight: 400 }] },
  );
}
