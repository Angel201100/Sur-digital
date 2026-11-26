import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import BrandMark from '../BrandMark.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'

const modules = [
  { to: '/admin', label: 'Resumen', icon: '⌂', permission: 'users.read', end: true },
  { to: '/admin/users', label: 'Usuarios', icon: '◉', permission: 'users.read' },
  { to: '/admin/clients', label: 'Clientes', icon: '◎', permission: 'clients.read' },
  { to: '/admin/roles', label: 'Roles', icon: '◇', permission: 'roles.read' },
  { to: '/admin/permissions', label: 'Permisos', icon: '▦', permission: 'permissions.read' },
  { to: '/admin/services', label: 'Servicios', icon: '✳', permission: 'services.read' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()
  const visibleModules = modules.filter(({ permission }) => user?.permissions.includes(permission))

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-line bg-white px-4 shadow-sm sm:px-6">
        <div className="flex items-center gap-3">
          <button type="button" className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink lg:hidden" onClick={() => setSidebarOpen((open) => !open)} aria-expanded={sidebarOpen} aria-label="Abrir navegación administrativa">
            ☰
          </button>
          <Link to="/admin" className="flex items-center gap-2 font-bold text-ink">
            <BrandMark className="h-9 w-9" />
            <span>Sur Digital <span className="hidden font-medium text-ink-soft sm:inline">/ Administración</span></span>
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-right sm:block">
            <span className="block font-semibold text-ink">{user?.first_name} {user?.last_name}</span>
            <span className="block text-xs capitalize text-ink-soft">{user?.role_name}</span>
          </span>
          <button type="button" onClick={signOut} className="rounded-full bg-ink px-4 py-2 font-semibold text-white hover:bg-teal-dark">
            Cerrar sesión
          </button>
        </div>
      </header>

      {sidebarOpen && <button type="button" aria-label="Cerrar menú lateral" className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed bottom-0 left-0 top-16 z-40 w-64 border-r border-line bg-white px-4 py-5 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <p className="px-3 pb-3 text-xs font-bold uppercase tracking-[.18em] text-slate-400">Módulos</p>
        <nav className="space-y-1" aria-label="Módulos administrativos">
          {visibleModules.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? 'bg-ink text-white' : 'text-ink-soft hover:bg-slate-100 hover:text-ink'
                }`
              }
            >
              <span className="grid h-6 w-6 place-items-center text-base" aria-hidden="true">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="absolute bottom-5 left-7 text-sm font-semibold text-teal-dark underline underline-offset-4">← Volver al sitio</Link>
      </aside>

      <main className="min-h-screen px-4 pb-12 pt-24 sm:px-6 lg:ml-64 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
