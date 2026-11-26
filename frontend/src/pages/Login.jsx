import { useCallback, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Alert from '../components/ui/Alert.jsx'
import FormField from '../components/ui/FormField.jsx'
import PasswordRequirements from '../components/ui/PasswordRequirements.jsx'
import RegisterModal from '../components/ui/RegisterModal.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { validateEmail, validPassword } from '../utils/validation.js'

const fieldClass = 'w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-ink outline-none transition focus:ring-4'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [touched, setTouched] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const { signIn, sessionError } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const emailError = touched.email && !validateEmail(email) ? 'Escribe un correo electrónico válido.' : ''
  const passwordError = touched.password && !validPassword(password) ? 'La contraseña no cumple los requisitos indicados.' : ''
  const closeRegister = useCallback(() => setRegisterOpen(false), [])

  const submit = async (event) => {
    event.preventDefault()
    setTouched({ email: true, password: true })
    if (!validateEmail(email) || !validPassword(password)) return
    setSubmitting(true)
    setError('')
    try {
      const user = await signIn({ email: email.trim(), password }, remember)
      const destination = location.state?.from?.pathname
      navigate(destination || (user.role_code === 'client' ? '/' : '/admin'), { replace: true })
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const registered = searchParams.get('registered') === '1'
  const visibleError = error || sessionError

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_.85fr] lg:items-center lg:px-8 lg:py-16">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-dark">Tu espacio digital</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">Bienvenido de nuevo.</h1>
        <p className="mt-4 max-w-xl text-lg leading-7 text-ink-soft">
          Inicia sesión para continuar con los servicios y herramientas de Sur Digital.
        </p>
        <div className="mt-8 hidden rounded-3xl bg-ink p-8 text-white shadow-card lg:block">
          <p className="text-sm font-bold uppercase tracking-wider text-teal">Acceso seguro</p>
          <p className="mt-3 text-2xl font-semibold">Tus permisos determinan qué puedes consultar y administrar.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-9">
        <h2 className="text-2xl font-bold text-ink">Iniciar sesión</h2>
        <p className="mt-1 text-sm text-ink-soft">Ingresa tu correo y contraseña.</p>
        {registered && <div className="mt-5"><Alert type="success">Cuenta creada correctamente. Ya puedes iniciar sesión.</Alert></div>}
        {visibleError && <div className="mt-5"><Alert>{visibleError}</Alert></div>}

        <form className="mt-6 space-y-5" onSubmit={submit} noValidate>
          <FormField name="login-email" label="Correo electrónico" error={emailError} valid={touched.email && !emailError}>
            {(state) => (
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                value={email}
                onChange={(event) => { setEmail(event.target.value); setTouched((current) => ({ ...current, email: true })) }}
                onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                className={`${fieldClass} ${state}`}
                required
                aria-invalid={Boolean(emailError)}
              />
            )}
          </FormField>
          <FormField name="login-password" label="Contraseña" error={passwordError} valid={touched.password && !passwordError}>
            {(state) => (
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                maxLength={128}
                value={password}
                onChange={(event) => { setPassword(event.target.value); setTouched((current) => ({ ...current, password: true })) }}
                onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                className={`${fieldClass} ${state}`}
                required
                aria-invalid={Boolean(passwordError)}
              />
            )}
          </FormField>
          <PasswordRequirements password={password} />

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 text-ink-soft">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-teal-dark"
              />
              Recordarme
            </label>
            <Link to="/recuperar-contrasena" className="font-semibold text-teal-dark underline underline-offset-4">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button type="submit" disabled={submitting} className="w-full rounded-xl bg-ink px-5 py-3 font-bold text-white transition hover:bg-teal-dark disabled:opacity-60">
            {submitting ? 'Verificando…' : 'Iniciar sesión'}
          </button>
          <p className="text-center text-sm text-ink-soft">
            ¿Aún no tienes cuenta?{' '}
            <button type="button" onClick={() => setRegisterOpen(true)} className="font-bold text-teal-dark underline underline-offset-4">
              Crear una cuenta
            </button>
          </p>
        </form>
      </div>

      <RegisterModal
        open={registerOpen}
        onClose={closeRegister}
        onRegistered={() => {
          closeRegister()
          navigate('/login?registered=1', { replace: true })
        }}
      />
    </section>
  )
}
