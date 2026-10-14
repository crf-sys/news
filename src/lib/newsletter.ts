import { randomBytes } from "node:crypto";
import { resend } from "./mail";
import { region as regionOf } from "./regions";
import type { Edition } from "./editions";

export const SITE = process.env.SITE_URL ?? "https://agora10.com";
export const FROM = "Ágora · Las 10 de hoy <las10@agora10.com>";
export const CONSENT_TEXT =
  "Acepto recibir cada mañana la newsletter de Ágora y el tratamiento de mi email según la política de privacidad.";

export const token = () => randomBytes(24).toString("base64url");

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const shell = (body: string, footer = "") => `<!doctype html><html lang="es"><body style="margin:0;background:#f4f2ee;font-family:Helvetica,Arial,sans-serif;color:#0b0b0c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden">
<tr><td style="background:#0b0b0c;padding:28px 28px 22px"><span style="font-family:Georgia,serif;font-size:34px;color:#f4f2ee">Ágora</span><span style="font-family:Georgia,serif;font-size:34px;color:#e4ff3a">.</span></td></tr>
<tr><td style="padding:28px">${body}</td></tr>
<tr><td style="padding:20px 28px 28px;font-size:12px;line-height:1.5;color:#77736d;border-top:1px solid #eee">${footer}Ágora · Información contra la desinformación · <a href="${SITE}" style="color:#77736d">agora10.com</a></td></tr>
</table></td></tr></table></body></html>`;

export async function sendConfirmation(email: string, confirmToken: string) {
  const url = `${SITE}/newsletter/confirmar?token=${confirmToken}`;
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Confirma tu registro en Ágora",
    html: shell(`<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:30px;margin:0 0 12px">Un clic y listo</h1>
<p style="font-size:16px;line-height:1.5;margin:0 0 24px">Confirma tu email para recibir cada mañana a las 07:00 <b>las 10 noticias del día</b>, con los hechos separados de la opinión.</p>
<a href="${url}" style="display:inline-block;background:#e4ff3a;color:#0b0b0c;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:999px">Confirmar mi email</a>
<p style="font-size:13px;color:#77736d;margin:24px 0 0">Si no te has registrado tú, ignora este mensaje y no te escribiremos más.</p>`),
    text: `Confirma tu registro en Ágora: ${url}\n\nSi no te has registrado tú, ignora este mensaje.`,
  });
}

/** Email diario: las 10 del día, cada una con su entradilla, cobertura y enlace al informe. */
export function dailyEmail(ed: Edition, unsubscribeToken: string) {
  const r = regionOf(ed.region)!;
  const date = new Date(ed.date + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  const unsub = `${SITE}/newsletter/baja?token=${unsubscribeToken}`;
  const items = ed.stories
    .map((s) => {
      const o = s.objectivity;
      const facts = s.claims.filter((c) => c.status === "hecho").length;
      const disputed = s.claims.filter((c) => c.status === "disputado").length;
      return `<tr><td style="padding:18px 0;border-top:1px solid #eee">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td valign="top" style="font-family:Georgia,serif;font-size:34px;color:#b5c91f;padding-right:14px;line-height:1">${s.rank}</td>
<td valign="top"><a href="${SITE}/tema/${s.id}" style="font-family:Georgia,serif;font-size:21px;line-height:1.2;color:#0b0b0c;text-decoration:none">${esc(s.headline)}</a>
<p style="font-size:15px;line-height:1.45;color:#3d3a36;margin:8px 0 8px">${esc(s.dek)}</p>
<p style="font-size:12px;color:#77736d;margin:0">${o ? `La cuentan ${o.outlets}${o.outletsTotal ? ` de ${o.outletsTotal}` : ""} medios · ` : ""}${facts} hechos${disputed ? ` · ${disputed} en disputa` : ""} · <a href="${SITE}/tema/${s.id}" style="color:#0b0b0c">Leer informe →</a></p>
</td></tr></table></td></tr>`;
    })
    .join("");
  return {
    subject: `Las 10 de hoy${ed.region === "es" ? "" : ` · ${r.short}`} — ${ed.stories[0]?.headline ?? ""}`.slice(0, 140),
    html: shell(
      `<p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#77736d;margin:0">${ed.region === "es" ? "Edición nacional" : `Edición ${esc(r.name)}`} · ${date}</p>
<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:34px;margin:8px 0 6px">Las 10 de hoy</h1>
<p style="font-size:15px;color:#3d3a36;margin:0 0 8px">Lo que más pesa hoy, con los hechos separados de la opinión. Cinco minutos.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items}</table>
<p style="margin:24px 0 0"><a href="${SITE}${ed.region === "es" ? "" : `/${ed.region}`}/informe" style="display:inline-block;background:#0b0b0c;color:#f4f2ee;text-decoration:none;padding:13px 24px;border-radius:999px">Ver el informe del día</a></p>`,
      `Recibes este email porque te registraste en Ágora. <a href="${unsub}" style="color:#77736d">Darme de baja</a> · `,
    ),
    text:
      `Las 10 de hoy · ${date}\n\n` +
      ed.stories.map((s) => `${s.rank}. ${s.headline}\n${s.dek}\n${SITE}/tema/${s.id}`).join("\n\n") +
      `\n\nDarme de baja: ${unsub}`,
    headers: { "List-Unsubscribe": `<${unsub}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  };
}
