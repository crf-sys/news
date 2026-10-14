const STEPS = [
  ["Leemos", "Cada madrugada recogemos titulares, extractos y posición en portada de los 10 medios (RSS, newsletters y portadas) y las columnas del panel de opinión."],
  ["Agrupamos", "Juntamos las piezas que hablan del mismo hecho aunque lo titulen distinto."],
  ["Ordenamos", "Puntuación pública: 50 % cuántos medios lo llevan, 30 % lo arriba que está en sus portadas, 20 % cuántos columnistas escriben sobre ello."],
  ["Separamos", "Cada afirmación se clasifica: Hecho (lo sostienen ≥3 medios de distinto signo), Disputado (hay medios que lo contradicen) u Opinión (valoración)."],
  ["Citamos", "Toda afirmación enlaza a los medios de los que sale. Si no hay fuente, no se publica."],
  ["Medimos", "Las fichas ideológicas se calculan a partir de lo que publican y muestran sus pruebas y su nivel de confianza."],
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
