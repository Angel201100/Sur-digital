import { useEffect, useState } from 'react'
import Alert from '../components/ui/Alert.jsx'
import Carousel from '../components/Carousel.jsx'
import slides from '../data/slides.js'
import { servicesApi } from '../services/api.js'

export default function Index() {
  const [services, setServices] = useState(slides)
  const [catalogWarning, setCatalogWarning] = useState('')

  useEffect(() => {
    let active = true
    servicesApi
      .publicList()
      .then((items) => {
        if (!active) return
        if (!items.length) {
          setCatalogWarning('El catálogo de la base de datos no tiene servicios activos. Se muestran los datos de ejemplo.')
          return
        }
        setServices(
          items.map((item) => ({
            id: item.id,
            titulo: item.title,
            descripcion: item.description,
            imagen: slides[Math.max(0, item.sort_order - 1) % slides.length].imagen,
          })),
        )
        setCatalogWarning('')
      })
      .catch((error) => {
        if (active) setCatalogWarning(`${error.message} Se muestran los servicios de ejemplo.`)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-teal/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.25em] text-teal">Tecnología para crecer</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Tecnología que <span className="text-teal">ordena</span> tu negocio.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Diseñamos y construimos software a la medida para que tu equipo trabaje mejor y tu empresa avance con claridad.
          </p>
          <a href="#servicios" className="mt-8 inline-flex rounded-full bg-amber px-6 py-3 font-bold text-ink transition hover:-translate-y-0.5 hover:bg-amber/90">
            Conoce nuestros servicios
          </a>
        </div>
      </section>

      <section id="servicios" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-dark">Lo que hacemos</p>
            <h2 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Soluciones para tu siguiente etapa</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-ink-soft">
            Explora nuestros servicios y encuentra el apoyo tecnológico que tu organización necesita.
          </p>
        </div>
        {catalogWarning && <div className="mb-5"><Alert>{catalogWarning}</Alert></div>}
        <Carousel slides={services} />
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            ['Cercanía', 'Entendemos tus procesos y hablamos claro en cada etapa.'],
            ['Calidad', 'Creamos soluciones útiles, accesibles y preparadas para crecer.'],
            ['Acompañamiento', 'Te ayudamos a adoptar y aprovechar la tecnología entregada.'],
          ].map(([title, description]) => (
            <article key={title} className="rounded-2xl border border-line p-6">
              <span className="mb-4 block h-1 w-12 rounded-full bg-amber" />
              <h3 className="text-xl font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
