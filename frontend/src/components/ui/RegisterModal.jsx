import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { authApi } from '../../services/api.js'
import {
  getPasswordRequirements,
  isValidRegistration,
  validateDocument,
  validateEmail,
  validatePhone,
} from '../../utils/validation.js'
import Alert from './Alert.jsx'
import FormField from './FormField.jsx'
import PasswordRequirements from './PasswordRequirements.jsx'

const emptyValues = {
  first_name: '',
  last_name: '',
  document_type: 'CC',
  document_number: '',
  address: '',
  phone: '',
  email: '',
  password: '',
  password_confirmation: '',
  accepted_data_policy: false,
}

function fieldError(name, values) {
  const value = values[name]
  if (name === 'first_name' || name === 'last_name') {
    if (!value.trim()) return 'Este campo es obligatorio.'
    if (value.trim().length < 2) return 'Escribe al menos 2 caracteres.'
    if (!/^[A-Za-zÀ-ÿ\s'-]+$/.test(value)) return 'Usa solo letras, espacios, apóstrofes o guiones.'
  }
  if (name === 'document_type' && !value) return 'Selecciona un tipo de documento.'
  if (name === 'document_number' && !validateDocument(value)) {
    return 'Usa entre 5 y 30 letras, números, puntos o guiones.'
  }
  if (name === 'address' && value.trim().length < 5) return 'Escribe una dirección de al menos 5 caracteres.'
  if (name === 'phone' && !validatePhone(value)) return 'Incluye entre 7 y 15 dígitos; puedes agregar el prefijo +.'
  if (name === 'email' && !validateEmail(value)) return 'Escribe un correo electrónico válido.'
  if (name === 'password' && !getPasswordRequirements(value, values.first_name, values.last_name).every((item) => item.valid)) {
    return 'Completa todos los requisitos de contraseña.'
  }
  if (name === 'password_confirmation' && !value) return 'Confirma tu contraseña.'
  if (name === 'password_confirmation' && value !== values.password) return 'Las contraseñas no coinciden.'
  if (name === 'accepted_data_policy' && !value) return 'Debes aceptar el tratamiento de datos personales.'
  return ''
}

const inputClass = (state) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:ring-4 ${state}`

export default function RegisterModal({ open, onClose, onRegistered }) {
  const dialogRef = useRef(null)
  const [values, setValues] = useState(emptyValues)
  const [touched, setTouched] = useState({})
  const [attempted, setAttempted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!open) return undefined
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.querySelector('[data-autofocus]')?.focus()

    function keepFocusInside(event) {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = [...dialogRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
      )]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', keepFocusInside)
    return () => {
      document.removeEventListener('keydown', keepFocusInside)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  const update = (event) => {
    const { name, value, checked, type } = event.target
    const next = { ...values, [name]: type === 'checkbox' ? checked : value }
    setValues(next)
    setTouched((current) => ({ ...current, [name]: true }))
    setMessage('')
  }

  const submit = async (event) => {
    event.preventDefault()
    setAttempted(true)
    const allTouched = Object.fromEntries(Object.keys(values).map((key) => [key, true]))
    setTouched(allTouched)
    if (!isValidRegistration(values)) return

    setSubmitting(true)
    setMessage('')
    try {
      const { password_confirmation, ...payload } = values
      await authApi.register(payload)
      setValues(emptyValues)
      onRegistered()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const field = (name) => touched[name] || attempted
  const error = (name) => (field(name) ? fieldError(name, values) : '')
  const renderInput = (name, label, type = 'text', options = {}) => (
    <FormField key={name} name={name} label={label} error={error(name)} valid={field(name) && !error(name)}>
      {(state) => (
        <input
          id={name}
          name={name}
          type={type}
          value={values[name]}
          onChange={update}
          onBlur={() => setTouched((current) => ({ ...current, [name]: true }))}
          className={inputClass(state)}
          required
          maxLength={options.maxLength}
          autoComplete={options.autoComplete}
          aria-invalid={Boolean(error(name))}
          aria-describedby={error(name) ? `${name}-error` : undefined}
          data-autofocus={name === 'first_name' ? true : undefined}
          placeholder={options.placeholder}
        />
      )}
    </FormField>
  )

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-ink/70 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-title"
        className="my-auto max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-dark">Sur Digital</p>
            <h2 id="register-title" className="mt-1 text-2xl font-bold text-ink">Crear cuenta de cliente</h2>
            <p className="mt-1 text-sm text-ink-soft">Completa tus datos para registrarte.</p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-ink-soft hover:bg-slate-100 hover:text-ink"
            aria-label="Cerrar registro"
            onClick={onClose}
          >
            <span aria-hidden="true" className="text-2xl leading-none">×</span>
          </button>
        </div>

        {message && <div className="mb-4"><Alert>{message}</Alert></div>}

        <form onSubmit={submit} className="space-y-5" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            {renderInput('first_name', 'Nombre', 'text', { maxLength: 80, autoComplete: 'given-name' })}
            {renderInput('last_name', 'Apellido', 'text', { maxLength: 80, autoComplete: 'family-name' })}
            <FormField name="document_type" label="Tipo de documento" error={error('document_type')} valid={field('document_type') && !error('document_type')}>
              {(state) => (
                <select
                  id="document_type"
                  name="document_type"
                  value={values.document_type}
                  onChange={update}
                  className={inputClass(state)}
                  required
                >
                  <option value="CC">Cédula de ciudadanía</option>
                  <option value="CE">Cédula de extranjería</option>
                  <option value="TI">Tarjeta de identidad</option>
                  <option value="NIT">NIT</option>
                  <option value="PASSPORT">Pasaporte</option>
                </select>
              )}
            </FormField>
            {renderInput('document_number', 'Número de documento', 'text', { maxLength: 30 })}
            {renderInput('address', 'Dirección', 'text', { maxLength: 200, autoComplete: 'street-address' })}
            {renderInput('phone', 'Teléfono', 'tel', { maxLength: 16, autoComplete: 'tel', placeholder: '+573001234567' })}
            {renderInput('email', 'Correo electrónico', 'email', { maxLength: 254, autoComplete: 'email' })}
            {renderInput('password', 'Contraseña', 'password', { maxLength: 128, autoComplete: 'new-password' })}
            {renderInput('password_confirmation', 'Confirmar contraseña', 'password', { maxLength: 128, autoComplete: 'new-password' })}
          </div>

          <PasswordRequirements password={values.password} firstName={values.first_name} lastName={values.last_name} />

          <div>
            <label className="flex items-start gap-3 text-sm text-ink-soft">
              <input
                type="checkbox"
                name="accepted_data_policy"
                checked={values.accepted_data_policy}
                onChange={update}
                className="mt-1 h-4 w-4 rounded border-slate-300 accent-teal-dark"
                required
                aria-invalid={Boolean(error('accepted_data_policy'))}
              />
              <span>
                Acepto el tratamiento de mis datos personales según la{' '}
                <a className="font-semibold text-teal-dark underline" href="/politica-de-datos" target="_blank" rel="noreferrer">
                  política de datos personales
                </a>
                .
              </span>
            </label>
            {error('accepted_data_policy') && <p className="mt-1 text-xs text-red-700">{error('accepted_data_policy')}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-ink px-5 py-3 font-semibold text-white transition hover:bg-teal-dark disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>
      </section>
    </div>,
    document.body,
  )
}
