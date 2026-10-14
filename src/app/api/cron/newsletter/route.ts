// Vercel Cron → envía la edición del día a los suscriptores a las 07:00 (Madrid).
// Vercel Cron va en UTC: 05:00 UTC en horario de verano, 06:00 UTC en invierno.
// Se programan ambas y aquí se comprueba la hora local para enviar solo una vez.
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const hour = Number(new Date().toLocaleString("en-GB", { timeZone: "Europe/Madrid", hour: "2-digit" }));
  if (hour !== 7) return Response.json({ skipped: true, hour });
  // TODO: cargar edición, renderizar email (React Email) y enviar en lote (Resend).
  return Response.json({ sent: 0 });
}
