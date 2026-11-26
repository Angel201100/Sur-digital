const contact = [
  { label: 'Correo electrónico', value: 'miguelangel0rojas.2@gmail.com', href: 'mailto:miguelangel0rojas.2@gmail.com' },
  { label: 'Teléfono / WhatsApp', value: '+57 311 700 6818', href: 'tel:+573117006818' },
  { label: 'Ubicación', value: 'Bogotá, Colombia' },
  { label: 'Horario', value: 'Lunes a viernes, 8:00 a. m. a 5:00 p. m.' },
]

export default function Contacto() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-dark">Hablemos</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink sm:text-5xl">Contacto</h1>
      <p className="mt-4 max-w-2xl text-lg leading-7 text-ink-soft">Cuéntanos qué necesitas y conversemos sobre cómo la tecnología puede ayudarte.</p>

      <div className="mt-9 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <dl className="grid gap-3">
          {contact.map(({ label, value, href }) => (
            <div key={label} className="rounded-2xl border border-line bg-white p-5">
              <dt className="text-xs font-bold uppercase tracking-wider text-ink-soft">{label}</dt>
              <dd className="mt-2 font-semibold text-ink">
                {href ? <a href={href} className="break-all text-teal-dark underline decoration-teal/40 underline-offset-4">{value}</a> : value}
              </dd>
            </div>
          ))}
        </dl>
        <iframe
          title="Mapa de Bogotá, Colombia"
          src="https://www.google.com/maps?q=Bogot%C3%A1%2C%20Colombia&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="min-h-80 w-full rounded-3xl border-0 shadow-card"
        />
      </div>
    </section>
  )
}
