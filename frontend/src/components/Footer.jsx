import { Link } from 'react-router-dom'
import BrandMark from './BrandMark.jsx'

const mapUrl = 'https://www.google.com/maps?q=Bogot%C3%A1%2C%20Colombia&output=embed'

export default function Footer() {
  return (
    <footer className="bg-ink text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3 text-white">
            <BrandMark className="h-11 w-11" />
            <span className="text-xl font-bold">Sur Digital</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6">
            Tecnología que ordena tu negocio. Soluciones digitales a la medida para crecer con confianza.
          </p>
        </div>

        <nav className="flex flex-col items-start gap-3 text-sm" aria-label="Enlaces del pie de página">
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-white">Explora</h2>
          <Link className="hover:text-teal" to="/">Inicio</Link>
          <Link className="hover:text-teal" to="/nosotros">¿Quiénes somos?</Link>
          <Link className="hover:text-teal" to="/contacto">Contacto</Link>
          <Link className="hover:text-teal" to="/login">Iniciar sesión</Link>
        </nav>

        <div className="text-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Contacto</h2>
          <a className="block break-all hover:text-teal" href="mailto:miguelangel0rojas.2@gmail.com">miguelangel0rojas.2@gmail.com</a>
          <a className="mt-2 block hover:text-teal" href="tel:+573117006818">+57 311 700 6818</a>
          <p className="mt-2">Bogotá, Colombia</p>
          <div className="mt-4 flex gap-4">
            <a href="https://www.instagram.com/surdigital" target="_blank" rel="noreferrer" className="font-semibold hover:text-teal" aria-label="Instagram de Sur Digital">Instagram</a>
            <a href="https://www.linkedin.com/company/sur-digital" target="_blank" rel="noreferrer" className="font-semibold hover:text-teal" aria-label="LinkedIn de Sur Digital">LinkedIn</a>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Ubicación</h2>
          <iframe
            title="Mapa de Bogotá, Colombia"
            src={mapUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-36 w-full rounded-xl border border-white/15"
          />
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Sur Digital S.A.S. Todos los derechos reservados. El contenido y la propiedad intelectual de este sitio pertenecen a Sur Digital.
      </div>
    </footer>
  )
}
