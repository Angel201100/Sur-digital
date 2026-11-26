import { Link, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/admin/AdminLayout.jsx'
import AdminResource from './components/admin/AdminResource.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import PublicLayout from './components/PublicLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminRoles from './pages/admin/AdminRoles.jsx'
import Contacto from './pages/Contacto.jsx'
import Index from './pages/Index.jsx'
import Login from './pages/Login.jsx'
import Nosotros from './pages/Nosotros.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import RecoverPassword from './pages/RecoverPassword.jsx'

function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-teal-dark">404</p>
      <h1 className="mt-2 text-4xl font-bold text-ink">No encontramos esa página</h1>
      <p className="mt-3 text-ink-soft">Revisa la dirección o vuelve al inicio.</p>
      <Link to="/" className="mt-7 inline-flex rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-teal-dark">Ir al inicio</Link>
    </section>
  )
}

function AccessDenied() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-ink">Acceso restringido</h1>
      <p className="mt-3 text-ink-soft">Tu rol no tiene permiso para abrir este módulo.</p>
      <Link to="/" className="mt-7 inline-flex rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-teal-dark">Volver al sitio</Link>
    </section>
  )
}

function RequirePermission({ code, children }) {
  return <ProtectedRoute permission={code}>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Index />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<RecoverPassword />} />
        <Route path="/politica-de-datos" element={<PrivacyPolicy />} />
        <Route path="/acceso-denegado" element={<AccessDenied />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<RequirePermission code="users.read"><AdminResource resource="users" /></RequirePermission>} />
        <Route path="clients" element={<RequirePermission code="clients.read"><AdminResource resource="clients" /></RequirePermission>} />
        <Route path="roles" element={<RequirePermission code="roles.read"><AdminRoles /></RequirePermission>} />
        <Route path="permissions" element={<RequirePermission code="permissions.read"><AdminResource resource="permissions" /></RequirePermission>} />
        <Route path="services" element={<RequirePermission code="services.read"><AdminResource resource="services" /></RequirePermission>} />
      </Route>
    </Routes>
  )
}
