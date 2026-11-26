import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Alert from '../components/ui/Alert.jsx'
import FormField from '../components/ui/FormField.jsx'
import PasswordRequirements from '../components/ui/PasswordRequirements.jsx'
import { authApi } from '../services/api.js'
import { validateEmail, validPassword } from '../utils/validation.js'

const inputClass = 'w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-ink outline-none transition focus:ring-4'

export default function RecoverPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setTouched(true)
    setMessage('')
    setError('')
    if (token ? !validPassword(password) : !validateEmail(email)) return

    setSubmitting(true)
    try {
      const result = token
        ? await authApi.confirmPasswordReset(token, password)
        : await authApi.requestPasswordReset(email.trim())
      setMessage(result.message)
      if (!token) setEmail('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-14 sm:px-6 lg:py-20">
      <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-dark">Recuperación segura</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">{token ? 'Crea una nueva contraseña' : 'Recuperar contraseña'}</h1>
        <p className="mt-3 text-sm leading-6 text-ink-soft">
          {token
            ? 'Elige una contraseña segura para volver a tu cuenta.'
            : 'Escribe el correo asociado a tu cuenta. Si está registrado, recibirás instrucciones para continuar.'}
        </p>
        {message && <div className="mt-5"><Alert type="success">{message}</Alert></div>}
        {error && <div className="mt-5"><Alert>{error}</Alert></div>}

        <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
          {token ? (
            <>
              <FormField name="new-password" label="Nueva contraseña" error={touched && !validPassword(password) ? 'Completa todos los requisitos.' : ''} valid={touched && validPassword(password)}>
                {(state) => (
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    maxLength={128}
                    value={password}
                    onChange={(event) => { setPassword(event.target.value); setTouched(true) }}
                    onBlur={() => setTouched(true)}
                    className={`${inputClass} ${state}`}
                    required
                  />
                )}
              </FormField>
              <PasswordRequirements password={password} />
            </>
          ) : (
            <FormField name="recovery-email" label="Correo electrónico" error={touched && !validateEmail(email) ? 'Escribe un correo electrónico válido.' : ''} valid={touched && validateEmail(email)}>
              {(state) => (
                <input
                  id="recovery-email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); setTouched(true) }}
                  onBlur={() => setTouched(true)}
                  className={`${inputClass} ${state}`}
                  required
                />
              )}
            </FormField>
          )}
          <button type="submit" disabled={submitting} className="w-full rounded-xl bg-ink px-5 py-3 font-bold text-white transition hover:bg-teal-dark disabled:opacity-60">
            {submitting ? 'Procesando…' : token ? 'Guardar contraseña' : 'Recuperar contraseña'}
          </button>
        </form>
        <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-teal-dark underline underline-offset-4">
          Volver al inicio de sesión
        </Link>
      </div>
    </section>
  )
}
