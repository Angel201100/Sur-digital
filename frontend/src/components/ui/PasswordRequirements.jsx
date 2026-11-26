import { getPasswordRequirements } from '../../utils/validation.js'

export default function PasswordRequirements({ password, firstName, lastName }) {
  const requirements = getPasswordRequirements(password, firstName, lastName)

  return (
    <ul className="grid gap-1 text-xs sm:grid-cols-2" aria-label="Requisitos de contraseña">
      {requirements.map(({ label, valid }) => (
        <li key={label} className={valid ? 'text-emerald-700' : 'text-slate-500'}>
          <span aria-hidden="true">{valid ? '✓' : '○'}</span> {label}
        </li>
      ))}
    </ul>
  )
}
