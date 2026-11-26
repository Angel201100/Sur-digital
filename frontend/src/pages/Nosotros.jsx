const pillars = [
  {
    title: 'Qué hacemos',
    text: 'Creamos sitios web, aplicaciones móviles, tiendas en línea y sistemas internos. También automatizamos procesos, integramos herramientas y damos soporte después de la entrega.',
  },
  {
    title: 'Misión',
    text: 'Entregar soluciones de software confiables que hagan más simple el trabajo diario de nuestros clientes y les permitan tomar mejores decisiones.',
  },
  {
    title: 'Visión',
    text: 'Ser el aliado tecnológico de referencia para las pymes de la región, reconocido por la calidad del trabajo y la cercanía con cada cliente.',
  },
]

export default function Nosotros() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-dark">Quiénes somos</p>
      <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">Tecnología cercana, pensada para las personas.</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-ink-soft">
        Sur Digital es una empresa de desarrollo de software que ayuda a pequeñas y medianas empresas a pasar de procesos manuales a sistemas claros, seguros y fáciles de usar.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {pillars.map(({ title, text }) => (
          <article key={title} className="rounded-3xl border border-line bg-white p-7 shadow-card">
            <span className="mb-5 block h-1 w-12 rounded-full bg-teal" />
            <h2 className="text-xl font-bold text-ink">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-ink-soft">{text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
