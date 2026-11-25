import { Routes, Route, Link } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Index from './pages/Index.jsx'
import Nosotros from './pages/Nosotros.jsx'
import Contacto from './pages/Contacto.jsx'

function NoEncontrada() {
  return (
    <section className="page container">
      <h1>Página no encontrada</h1>
      <p>La dirección que buscas no existe.</p>
      <Link className="btn" to="/">Volver al inicio</Link>
    </section>
  )
}

export default function App() {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
