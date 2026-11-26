import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../../components/ui/Alert.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { apiRequest } from '../../services/api.js'

const cards = [
  { key: 'users', label: 'Usuarios', href: '/admin/users', permission: 'users.read' },
  { key: 'clients', label: 'Clientes', href: '/admin/clients', permission: 'clients.read' },
  { key: 'roles', label: 'Roles', href: '/admin/roles', permission: 'roles.read' },
  { key: 'permissions', label: 'Permisos', href: '/admin/permissions', permission: 'permissions.read' },
  { key: 'services', label: 'Servicios', href: '/admin/services', permission: 'services.read' },
]

export default function AdminDashboard() {
  const { token, user } = useAuth()
  const [counts, setCounts] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const available = cards.filter((card) => user.permissions.includes(card.permission))
    Promise.all(
      available.map(async (card) => {
        const rows = await apiRequest(`/admin/${card.key}`, { token })
        return [card.key, rows.length]
      }),
    )
      .then((entries) => {
        if (active) setCounts(Object.fromEntries(entries))
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
    return () => { active = false }
  }, [token, user])

  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-dark">Panel administrativo</p>
      <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Hola, {user.first_name}</h1>
      <p className="mt-2 text-ink-soft">Consulta los módulos habilitados según tu rol y permisos.</p>
      {error && <div className="mt-5"><Alert>{error}</Alert></div>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.filter((card) => user.permissions.includes(card.permission)).map((card) => (
          <Link key={card.key} to={card.href} className="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-card">
            <p className="text-sm font-semibold text-ink-soft">{card.label}</p>
            <p className="mt-2 text-4xl font-bold text-ink">{counts[card.key] ?? '—'}</p>
            <span className="mt-5 inline-block text-sm font-bold text-teal-dark">Abrir módulo →</span>
          </Link>
        ))}
      </div>
      <p className="mt-8 rounded-2xl border border-amber/40 bg-amber/10 p-4 text-sm leading-6 text-ink">
        Los permisos se verifican también en la API. Ocultar un módulo en esta interfaz no sustituye la autorización del servidor.
      </p>
    </div>
  )
}
