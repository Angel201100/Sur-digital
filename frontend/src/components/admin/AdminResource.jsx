import { useCallback, useEffect, useMemo, useState } from 'react'
import Alert from '../ui/Alert.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { apiRequest } from '../../services/api.js'

const baseInput = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-teal-dark focus:ring-4 focus:ring-teal/20'

const resources = {
  users: {
    title: 'Usuarios',
    description: 'Cuentas de administradores, empleados y clientes.',
    endpoint: 'users',
    permission: 'users',
    fields: [
      { key: 'first_name', label: 'Nombre', required: true, maxLength: 80 },
      { key: 'last_name', label: 'Apellido', required: true, maxLength: 80 },
      { key: 'document_type', label: 'Tipo de documento', type: 'select', required: true, options: [['CC', 'Cédula'], ['CE', 'Cédula de extranjería'], ['NIT', 'NIT'], ['PASSPORT', 'Pasaporte'], ['TI', 'Tarjeta de identidad']] },
      { key: 'document_number', label: 'Número de documento', required: true, maxLength: 30 },
      { key: 'address', label: 'Dirección', required: true, maxLength: 200 },
      { key: 'phone', label: 'Teléfono', required: true, maxLength: 16 },
      { key: 'email', label: 'Correo', type: 'email', required: true, maxLength: 254 },
      { key: 'role_id', label: 'Rol', type: 'role', required: true },
      { key: 'password', label: 'Contraseña inicial', type: 'password', requiredOnCreate: true, maxLength: 128 },
      { key: 'is_active', label: 'Cuenta activa', type: 'checkbox' },
    ],
  },
  clients: {
    title: 'Clientes',
    description: 'Consulta y administra cuentas con rol de cliente.',
    endpoint: 'clients',
    permission: 'clients',
    fields: [
      { key: 'first_name', label: 'Nombre', required: true, maxLength: 80 },
      { key: 'last_name', label: 'Apellido', required: true, maxLength: 80 },
      { key: 'document_type', label: 'Tipo de documento', type: 'select', required: true, options: [['CC', 'Cédula'], ['CE', 'Cédula de extranjería'], ['NIT', 'NIT'], ['PASSPORT', 'Pasaporte'], ['TI', 'Tarjeta de identidad']] },
      { key: 'document_number', label: 'Número de documento', required: true, maxLength: 30 },
      { key: 'address', label: 'Dirección', required: true, maxLength: 200 },
      { key: 'phone', label: 'Teléfono', required: true, maxLength: 16 },
      { key: 'email', label: 'Correo', type: 'email', required: true, maxLength: 254 },
      { key: 'password', label: 'Contraseña inicial', type: 'password', requiredOnCreate: true, maxLength: 128 },
      { key: 'is_active', label: 'Cuenta activa', type: 'checkbox' },
    ],
  },
  services: {
    title: 'Servicios',
    description: 'Administra los servicios que se muestran en el carrusel público.',
    endpoint: 'services',
    permission: 'services',
    fields: [
      { key: 'title', label: 'Nombre', required: true, maxLength: 120 },
      { key: 'slug', label: 'Identificador URL', required: true, maxLength: 100 },
      { key: 'description', label: 'Descripción', type: 'textarea', required: true },
      { key: 'sort_order', label: 'Orden', type: 'number', required: true },
      { key: 'is_active', label: 'Servicio activo', type: 'checkbox' },
    ],
  },
  permissions: {
    title: 'Permisos',
    description: 'Define permisos de módulo; asígnalos a roles desde la sección Roles.',
    endpoint: 'permissions',
    permission: 'permissions',
    fields: [
      { key: 'name', label: 'Nombre', required: true, maxLength: 100 },
      { key: 'code', label: 'Código', required: true, maxLength: 80 },
      { key: 'module', label: 'Módulo', required: true, maxLength: 60 },
      { key: 'description', label: 'Descripción', type: 'textarea' },
    ],
  },
}

function defaultValues(fields) {
  return Object.fromEntries(fields.map((field) => [field.key, field.type === 'checkbox' ? true : field.type === 'number' ? 0 : '']))
}

export default function AdminResource({ resource }) {
  const config = resources[resource]
  const { token, user } = useAuth()
  const [rows, setRows] = useState([])
  const [roles, setRoles] = useState([])
  const [selected, setSelected] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [values, setValues] = useState(() => defaultValues(config.fields))
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const baseUrl = `/admin/${config.endpoint}`

  const canCreate = user.permissions.includes(`${config.permission}.create`)
  const canUpdate = user.permissions.includes(`${config.permission}.update`)
  const canDelete = user.permissions.includes(`${config.permission}.delete`)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [items, roleItems] = await Promise.all([
        apiRequest(baseUrl, { token }),
        resource === 'users' ? apiRequest('/admin/roles', { token }) : Promise.resolve([]),
      ])
      setRows(items)
      setRoles(roleItems)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [baseUrl, token, resource])

  useEffect(() => { load() }, [load])

  const fields = useMemo(() => config.fields, [config.fields])

  function startCreate() {
    setSelected(null)
    setFormOpen(true)
    setValues(defaultValues(fields))
    setNotice('')
    setError('')
  }

  function startEdit(row) {
    setSelected(row)
    setFormOpen(true)
    setValues({ ...defaultValues(fields), ...row, password: '' })
    setNotice('')
    setError('')
  }

  function changeField(key, value) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function save(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setNotice('')
    const payload = { ...values }
    if (selected || !payload.password) delete payload.password
    if (resource === 'clients') payload.accepted_data_policy = true
    try {
      await apiRequest(selected ? `${baseUrl}/${selected.id}` : baseUrl, {
        token,
        method: selected ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      })
      setNotice(selected ? 'Cambios guardados correctamente.' : 'Registro creado correctamente.')
      setSelected(null)
      setFormOpen(false)
      setValues(defaultValues(fields))
      await load()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(row) {
    if (!window.confirm(`¿Confirmas la eliminación o desactivación de "${row.title || row.name || row.email || row.code}"?`)) return
    setError('')
    setNotice('')
    try {
      const result = await apiRequest(`${baseUrl}/${row.id}`, { token, method: 'DELETE' })
      setNotice(result.message || 'Registro eliminado correctamente.')
      await load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  function fieldControl(field) {
    const common = {
      id: field.key,
      name: field.key,
      className: baseInput,
      required: !selected && (field.required || field.requiredOnCreate),
      maxLength: field.maxLength,
      value: values[field.key] ?? '',
      onChange: (event) => changeField(field.key, field.type === 'number' ? Number(event.target.value) : event.target.value),
    }
    if (field.type === 'checkbox') {
      return (
        <label key={field.key} className="flex items-center gap-2 text-sm font-medium text-ink">
          <input type="checkbox" checked={Boolean(values[field.key])} onChange={(event) => changeField(field.key, event.target.checked)} className="h-4 w-4 accent-teal-dark" />
          {field.label}
        </label>
      )
    }
    if (field.type === 'select') {
      return <select key={field.key} {...common}>{field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
    }
    if (field.type === 'role') {
      return <select key={field.key} {...common}><option value="">Selecciona un rol</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select>
    }
    if (field.type === 'textarea') {
      return <textarea key={field.key} {...common} rows={3} />
    }
    return <input key={field.key} {...common} type={field.type || 'text'} min={field.type === 'number' ? 0 : undefined} autoComplete={field.type === 'password' ? 'new-password' : undefined} />
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-dark">Administración</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">{config.title}</h1>
          <p className="mt-1 text-sm text-ink-soft">{config.description}</p>
        </div>
        {canCreate && <button type="button" onClick={startCreate} className="rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-teal-dark">Crear registro</button>}
      </div>

      {error && <div className="mt-5"><Alert>{error}</Alert></div>}
      {notice && <div className="mt-5"><Alert type="success">{notice}</Alert></div>}

      {(formOpen || selected || (canCreate && rows.length === 0)) && (
        <form onSubmit={save} className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-bold text-ink">{selected ? `Editar ${config.title.toLowerCase()}` : `Nuevo registro`}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.filter((field) => field.type === 'checkbox').map(fieldControl)}
            {fields.filter((field) => field.type !== 'checkbox').map((field) => (
              <label key={field.key} htmlFor={field.key} className={`space-y-1.5 text-sm font-semibold text-ink ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                <span>{field.label}</span>
                {fieldControl(field)}
              </label>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" disabled={submitting} className="rounded-xl bg-teal-dark px-5 py-2.5 text-sm font-bold text-white hover:bg-ink disabled:opacity-60">{submitting ? 'Guardando…' : 'Guardar'}</button>
            {selected && <button type="button" onClick={startCreate} className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink">Cancelar edición</button>}
          </div>
        </form>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-ink-soft">Cargando registros…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-ink-soft">No hay registros para mostrar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-3">Registro</th>
                  <th className="px-4 py-3">Detalle</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold text-ink">{row.title || row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.code}</td>
                    <td className="max-w-sm truncate px-4 py-3 text-ink-soft">{row.email || row.description || row.code || row.slug || row.module}</td>
                    <td className="px-4 py-3">
                      {'is_active' in row ? <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${row.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>{row.is_active ? 'Activo' : 'Inactivo'}</span> : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        {canUpdate && <button type="button" onClick={() => startEdit(row)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold hover:bg-slate-100">Editar</button>}
                        {canDelete && <button type="button" onClick={() => remove(row)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Eliminar</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
