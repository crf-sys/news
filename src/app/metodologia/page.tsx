const STEPS = [
  ["Leemos", "Tres veces al día recogemos titular, enlace y extracto de los medios que permiten la lectura automática. Los que se la reservan solo los leen personas, hasta tener licencia."],
  ["Agrupamos", "La IA junta las piezas que hablan del mismo hecho aunque lo titulen distinto."],
  ["Ordenamos por cobertura", "Manda cuántos medios distintos cuentan la noticia. A igualdad, cuántas piezas le dedican y su actualidad. La IA solo descarta lo que no es de interés público, como deportes, famosos o servicio."],
  ["Leemos a fondo y comparamos", "Un agente lee las piezas completas cuando el medio lo permite, compara cifras y versiones y detecta lenguaje cargado y omisiones."],
  ["Verificamos", "Ante cualquier duda acude a fuentes primarias (BOE, Congreso, INE, CIS, CGPJ, Banco de España, AIReF), a verificadores (Newtral, Maldita, EFE Verifica) y a nuestra hemeroteca. Si no puede comprobarlo, lo dice."],
  ["Separamos", "Hecho: lo sostienen al menos 2 medios independientes sin contradicción, o lo confirma una fuente oficial. Disputado: hay versiones o cifras distintas. Opinión: valoraciones y predicciones."],
  ["Citamos", "Cada afirmación enlaza a los medios y documentos de los que sale. Sin fuente, no se publica."],
  ["Medimos, no etiquetamos", "La posición de medios y voces se calcula a partir de lo que publican, con las pruebas y la confianza a la vista. Hasta tener datos suficientes, aparece como “en calibración”."],
];

export default function Metodologia() {
  return (
    <main className="grain mx-auto max-w-4xl px-4 pt-10 sm:pt-16">
      <p className="label text-accent">Cómo funciona</p>
      <h1 className="display mt-4 text-7xl sm:text-9xl">Método</h1>
      <ol className="mt-12 space-y-10">
        {STEPS.map(([t, d], i) => (
          <li key={t} className="grid grid-cols-[4rem_1fr] gap-4 sm:grid-cols-[7rem_1fr]">
            <span className="numeral text-6xl text-accent sm:text-8xl">{i + 1}</span>
            <div><h2 className="display text-4xl sm:text-5xl">{t}</h2><p className="mt-2 text-lg text-muted">{d}</p></div>
          </li>
        ))}
      </ol>
    </main>
  );
}
