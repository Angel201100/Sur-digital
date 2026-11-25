import Carousel from '../components/Carousel.jsx'
import slides from '../data/slides.js'

export default function Index() {
  return (
    <>
      <section className="intro container">
        <h1>Tecnología que ordena tu negocio</h1>
        <p>
          Diseñamos y construimos software a la medida. Estos son los diez servicios con los que
          podemos ayudarte.
        </p>
      </section>
      <div className="container">
        <Carousel slides={slides} />
      </div>
    </>
  )
}
