export default function FormField({
  label,
  name,
  error,
  valid,
  hint,
  className = '',
  children,
}) {
  const stateClass = error
    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
    : valid
      ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100'
      : 'border-slate-300 focus:border-teal-dark focus:ring-teal/20'

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={name} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {children(stateClass)}
      {error ? (
        <p id={`${name}-error`} className="text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-soft">{hint}</p>
      ) : valid ? (
        <p className="text-xs text-emerald-700">Dato válido</p>
      ) : null}
    </div>
  )
}
