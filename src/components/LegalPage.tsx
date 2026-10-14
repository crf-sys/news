export function LegalPage({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-10 sm:pt-16">
      <p className="label text-accent">{kicker}</p>
      <h1 className="display mt-4 text-6xl sm:text-8xl">{title}</h1>
      <div className="mt-10 space-y-6 text-lg leading-relaxed text-fg/90 [&_h2]:display [&_h2]:mt-12 [&_h2]:text-4xl [&_li]:ml-5 [&_li]:list-disc [&_table]:w-full [&_td]:border-b [&_td]:border-line [&_td]:py-2 [&_td]:pr-3 [&_td]:align-top [&_td]:text-base [&_th]:pb-2 [&_th]:text-left [&_th]:label [&_th]:text-[10px] [&_th]:text-muted">
        {children}
      </div>
    </main>
  );
}
