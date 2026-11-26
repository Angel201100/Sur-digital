import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

export default function ProtectedRoute({ children, permission }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="grid min-h-60 place-items-center text-sm font-semibold text-ink-soft">Verificando sesión…</div>
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (permission && !user.permissions.includes(permission)) {
    return <Navigate to="/acceso-denegado" replace />
  }
  return children
}
