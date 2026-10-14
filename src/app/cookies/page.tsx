import { LegalPage } from "@/components/LegalPage";
import { TITULAR } from "@/lib/legal";
import { CookieSettingsButton } from "@/components/CookieConsent";

export default function Cookies() {
  return (
    <LegalPage kicker={`Actualizada el ${TITULAR.updated}`} title="Cookies">
      <p>Usamos las mínimas cookies posibles. Hoy solo empleamos cookies <b>técnicas</b>, necesarias para que la web funcione y para iniciar sesión. Según el art. 22.2 de la LSSI y la guía de la AEPD, no requieren consentimiento. No usamos cookies publicitarias ni de seguimiento.</p>
      <h2>Cookies que usamos</h2>
      <table>
        <thead><tr><th>Cookie</th><th>Proveedor</th><th>Finalidad</th><th>Duración</th></tr></thead>
        <tbody>
          <tr><td>__session, __client_uat, __clerk_db_jwt</td><td>Clerk (agora10.com)</td><td>Mantener tu sesión iniciada de forma segura</td><td>Sesión / hasta 1 año</td></tr>
          <tr><td>agora_consent (almacenamiento local)</td><td>Ágora</td><td>Recordar tus preferencias de cookies</td><td>12 meses</td></tr>
        </tbody>
      </table>
      <h2>Analítica</h2>
      <p>Si en el futuro activamos analítica, solo se cargará después de que la aceptes en el panel de preferencias. Podrás cambiar de opinión cuando quieras.</p>
      <CookieSettingsButton />
    </LegalPage>
  );
}
