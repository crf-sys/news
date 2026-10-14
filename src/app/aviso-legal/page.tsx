import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { TITULAR } from "@/lib/legal";

export default function AvisoLegal() {
  return (
    <LegalPage kicker={`Actualizado el ${TITULAR.updated}`} title="Aviso legal">
      <h2>Titular</h2>
      <p>En cumplimiento del art. 10 de la Ley 34/2002 (LSSI): {TITULAR.name}, EIN {TITULAR.nif}, con domicilio en {TITULAR.address}. Contacto: <a className="underline" href={`mailto:${TITULAR.email}`}>{TITULAR.email}</a>.</p>
      <h2>Contenidos y fuentes</h2>
      <p>Ágora elabora informes propios a partir de información pública. No reproduce los contenidos de terceros: cita, resume con palabras propias y enlaza siempre al original. Respetamos los derechos de propiedad intelectual de los editores y sus condiciones de uso.</p>
      <h2>Uso de inteligencia artificial</h2>
      <p>Los informes se generan con ayuda de inteligencia artificial y siguen un <Link className="underline" href="/metodologia">método público</Link>. Cada afirmación indica sus fuentes y su nivel de verificación. Si detectas un error, escríbenos y lo corregiremos de forma visible.</p>
      <h2>Propiedad intelectual</h2>
      <p>El diseño, el código y los textos propios de Ágora pertenecen a su titular. Las marcas y contenidos de los medios citados pertenecen a sus titulares.</p>
    </LegalPage>
  );
}
