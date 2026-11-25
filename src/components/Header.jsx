import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

const enlaces = [
  { to: '/', texto: 'Inicio' },
  { to: '/nosotros', texto: '¿Quiénes somos?' },
  { to: '/contacto', texto: 'Contacto' },
]

export default function Header() {
  const [abierto, setAbierto] = useState(false)
  const cerrar = () => setAbierto(false)

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo" onClick={cerrar}>
          <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="20" cy="32" r="8" fill="#2EC4B6" />
            <circle cx="46" cy="18" r="6" fill="#F2B134" />
            <circle cx="46" cy="46" r="6" fill="#F2B134" />
            <path d="M20 32L46 18M20 32L46 46" stroke="#F3F5F7" strokeWidth="3" />
          </svg>
          Sur Digital
        </Link>

        <button
          className="header__toggle"
          aria-expanded={abierto}
          aria-controls="menu-principal"
          onClick={() => setAbierto(!abierto)}
        >
          {abierto ? 'Cerrar' : 'Menú'}
        </button>

        <nav id="menu-principal" className={`header__nav ${abierto ? 'is-open' : ''}`} aria-label="Principal">
          {enlaces.map(({ to, texto }) => (
            <NavLink key={to} to={to} end onClick={cerrar}>
              {texto}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
