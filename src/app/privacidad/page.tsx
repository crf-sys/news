import { LegalPage } from "@/components/LegalPage";
import { TITULAR } from "@/lib/legal";

export default function Privacidad() {
  return (
    <LegalPage kicker={`Actualizada el ${TITULAR.updated}`} title="Privacidad">
      <p>Cumplimos el Reglamento General de Protección de Datos (RGPD, UE 2016/679) y la Ley Orgánica 3/2018 (LOPDGDD). Pedimos los mínimos datos posibles y nunca los vendemos.</p>
      <h2>Responsable</h2>
      <p>{TITULAR.name} · EIN {TITULAR.nif} · {TITULAR.address} · <a className="underline" href={`mailto:${TITULAR.email}`}>{TITULAR.email}</a></p>
      <h2>Qué datos tratamos y para qué</h2>
      <table>
        <thead><tr><th>Dato</th><th>Finalidad</th><th>Base legal</th><th>Conservación</th></tr></thead>
        <tbody>
          <tr><td>Email de la newsletter</td><td>Enviarte cada mañana “Las 10 de hoy”</td><td>Tu consentimiento (art. 6.1.a RGPD)</td><td>Hasta que te des de baja</td></tr>
          <tr><td>Cuenta de usuario (email, nombre)</td><td>Gestionar tu registro y tus preferencias</td><td>Ejecución de las condiciones del servicio (art. 6.1.b)</td><td>Mientras mantengas la cuenta</td></tr>
          <tr><td>Email en una propuesta de voz (opcional)</td><td>Avisarte del resultado de tu propuesta</td><td>Tu consentimiento (art. 6.1.a)</td><td>12 meses</td></tr>
          <tr><td>Registros técnicos</td><td>Seguridad y prevención de abusos</td><td>Interés legítimo (art. 6.1.f)</td><td>30 días</td></tr>
        </tbody>
      </table>
      <h2>Con quién se comparten</h2>
      <p>Solo con proveedores que nos prestan el servicio, con contrato de encargo de tratamiento y garantías del RGPD: Vercel (alojamiento), Neon (base de datos), Clerk (inicio de sesión) y Resend (envío de emails). Algunos pueden tratar datos fuera del Espacio Económico Europeo al amparo de cláusulas contractuales tipo o del Marco de Privacidad de Datos UE-EE. UU.</p>
      <h2>Tus derechos</h2>
      <p>Puedes acceder, rectificar, suprimir, oponerte, limitar el tratamiento, pedir la portabilidad y retirar tu consentimiento en cualquier momento escribiendo a <a className="underline" href={`mailto:${TITULAR.email}`}>{TITULAR.email}</a>. Cada newsletter incluye un enlace para darte de baja. Si crees que no hemos atendido bien tu solicitud, puedes reclamar ante la <a className="underline" href="https://www.aepd.es" target="_blank" rel="noreferrer">Agencia Española de Protección de Datos</a>.</p>
      <h2>Menores</h2>
      <p>El registro está reservado a mayores de 14 años, conforme al art. 7 LOPDGDD.</p>
    </LegalPage>
  );
}
