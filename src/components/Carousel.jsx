import { useEffect, useState, useCallback } from 'react'

/**
 * Carrusel reutilizable.
 * Props:
 *  - slides: [{ id, imagen, titulo, descripcion }]
 *  - autoPlay (bool) y intervalo (ms)
 */
export default function Carousel({ slides = [], autoPlay = true, intervalo = 5000 }) {
  const [actual, setActual] = useState(0)
  const [pausado, setPausado] = useState(false)
  const total = slides.length

  const siguiente = useCallback(() => setActual((i) => (i + 1) % total), [total])
  const anterior = useCallback(() => setActual((i) => (i - 1 + total) % total), [total])

  useEffect(() => {
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!autoPlay || pausado || sinMovimiento || total < 2) return
    const id = setInterval(siguiente, intervalo)
    return () => clearInterval(id)
  }, [autoPlay, pausado, intervalo, siguiente, total])

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') siguiente()
    if (e.key === 'ArrowLeft') anterior()
  }

  if (total === 0) return null

  return (
    <section
      className="carousel"
      aria-roledescription="carrusel"
      aria-label="Nuestros servicios"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div className="carousel__viewport">
        <div className="carousel__track" style={{ transform: `translateX(-${actual * 100}%)` }}>
          {slides.map((s, i) => (
            <figure
              className="carousel__slide"
              key={s.id}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${total}`}
              aria-hidden={i !== actual}
            >
              <img src={s.imagen} alt={s.titulo} loading={i === 0 ? 'eager' : 'lazy'} />
              <figcaption className="carousel__caption">
                <h2>{s.titulo}</h2>
                <p>{s.descripcion}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <button className="carousel__btn carousel__btn--prev" onClick={anterior} aria-label="Imagen anterior">
          ‹
        </button>
        <button className="carousel__btn carousel__btn--next" onClick={siguiente} aria-label="Imagen siguiente">
          ›
        </button>
      </div>

      <div className="carousel__bar">
        <span className="carousel__count" aria-live="polite">
          {actual + 1} / {total}
        </span>
        <div className="carousel__dots">
          {slides.map((s, i) => (
            <button
              key={s.id}
              className={`carousel__dot ${i === actual ? 'is-active' : ''}`}
              onClick={() => setActual(i)}
              aria-label={`Ir a la imagen ${i + 1}: ${s.titulo}`}
              aria-current={i === actual}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
