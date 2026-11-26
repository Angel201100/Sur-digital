import { useCallback, useEffect, useState } from 'react'

export default function Carousel({ slides = [], autoPlay = true, interval = 5000 }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = slides.length
  const next = useCallback(() => setActiveIndex((index) => (index + 1) % total), [total])
  const previous = useCallback(() => setActiveIndex((index) => (index - 1 + total) % total), [total])

  useEffect(() => {
    if (!autoPlay || paused || total < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = window.setInterval(next, interval)
    return () => window.clearInterval(timer)
  }, [autoPlay, paused, total, interval, next])

  if (!total) return null

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      next()
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      previous()
    }
  }

  return (
    <section
      className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-card"
      aria-label="Nuestros servicios"
      aria-roledescription="carrusel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
      }}
    >
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 motion-reduce:transition-none"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <figure
              key={slide.id}
              className="relative m-0 min-w-full"
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${index + 1} de ${total}`}
              aria-hidden={index !== activeIndex}
            >
              <img
                src={slide.imagen}
                alt={slide.titulo}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="aspect-[16/10] w-full bg-ink object-cover sm:aspect-[16/8]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/95 via-ink/65 to-transparent px-6 pb-7 pt-20 text-white sm:px-12 sm:pb-10">
                <p className="mb-2 text-xs font-bold uppercase tracking-[.22em] text-teal">Soluciones digitales</p>
                <h2 className="text-2xl font-bold sm:text-4xl">{slide.titulo}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-100 sm:text-base">{slide.descripcion}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <button
          type="button"
          className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-2xl text-ink shadow-lg transition hover:bg-amber sm:left-6"
          onClick={previous}
          aria-label="Servicio anterior"
        >
          ‹
        </button>
        <button
          type="button"
          className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-2xl text-ink shadow-lg transition hover:bg-amber sm:right-6"
          onClick={next}
          aria-label="Siguiente servicio"
        >
          ›
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <span className="text-sm font-semibold tabular-nums text-ink-soft" aria-live="polite">
          {activeIndex + 1} <span className="text-slate-400">/</span> {total}
        </span>
        <div className="flex flex-wrap justify-end gap-2" aria-label="Seleccionar servicio">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`h-2.5 rounded-full transition-all ${index === activeIndex ? 'w-8 bg-teal-dark' : 'w-2.5 bg-slate-300 hover:bg-ink-soft'}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Ir a ${slide.titulo}`}
              aria-current={index === activeIndex}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
