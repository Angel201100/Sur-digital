import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <strong>Nodo Digital S.A.S.</strong>
          <p>Software a la medida para empresas que quieren crecer con orden.</p>
        </div>
        <nav aria-label="Pie de página">
          <Link to="/">Inicio</Link>
          <Link to="/nosotros">¿Quiénes somos?</Link>
          <Link to="/contacto">Contacto</Link>
        </nav>
      </div>
      <div className="container footer__legal">
        © {new Date().getFullYear()} Nodo Digital S.A.S. Todos los derechos reservados.
      </div>
    </footer>
  )
}
