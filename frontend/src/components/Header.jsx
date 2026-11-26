import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import BrandMark from './BrandMark.jsx'

const links = [
  { to: '/', text: 'Inicio' },
  { to: '/nosotros', text: 'Nosotros' },
  { to: '/contacto', text: 'Contacto' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-ink/95 text-white shadow-lg shadow-ink/10 backdrop-blur">
      <div className="mx-auto flex min-h-[76px] max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 font-bold tracking-tight text-white" onClick={closeMenu}>
          <BrandMark className="h-10 w-10" />
          <span className="text-lg sm:text-xl">Sur <span className="text-teal">Digital</span></span>
        </Link>

        <button
          type="button"
          className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold md:hidden"
          aria-expanded={menuOpen}
          aria-controls="public-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? 'Cerrar' : 'Menú'}
        </button>

        <nav
          id="public-navigation"
          aria-label="Navegación principal"
          className={`${menuOpen ? 'flex' : 'hidden'} w-full flex-col gap-1 pb-4 md:flex md:w-auto md:flex-row md:items-center md:gap-2 md:pb-0`}
        >
          {links.map(({ to, text }) => (
            <NavLink
              key={to}
              to={to}
              end
              onClick={closeMenu}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-teal text-ink' : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {text}
            </NavLink>
          ))}
          {user ? (
            <>
              <Link to="/admin" onClick={closeMenu} className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold hover:bg-white/10">
                Mi panel
              </Link>
              <button type="button" onClick={() => { signOut(); closeMenu() }} className="px-3 py-2 text-sm text-slate-300 hover:text-white">
                Salir
              </button>
            </>
          ) : (
            <Link to="/login" onClick={closeMenu} className="rounded-full bg-amber px-5 py-2 text-sm font-bold text-ink transition hover:bg-amber/90">
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
