import { useCallback, useEffect, useState } from 'react'
import Alert from '../../components/ui/Alert.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { apiRequest } from '../../services/api.js'

const blankRole = { code: '', name: '', description: '', is_active: true }
const input = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-teal-dark focus:ring-4 focus:ring-teal/20'

export default function AdminRoles() {
  const { token, refreshUser } = useAuth()
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [selected, setSelected] = useState(null)
  const [values, setValues] = useState(blankRole)
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [roleRows, permissionRows] = await Promise.all([
        apiRequest('/admin/roles', { token }),
        apiRequest('/admin/permissions', { token }),
      ])
      setRoles(roleRows)
      setPermissions(permissionRows)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  function editRole(role) {
    setSelected(role)
    setValues({ code: role.code, name: role.name, description: role.description || '', is_active: role.is_active })
    setSelectedPermissions(role.permission_ids)
    setNotice('')
  }

  function newRole() {
    setSelected(null)
    setValues(blankRole)
    setSelectedPermissions([])
    setNotice('')
  }

  async function saveRole(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const role = await apiRequest(selected ? `/admin/roles/${selected.id}` : '/admin/roles', {
        token,
        method: selected ? 'PATCH' : 'POST',
        body: JSON.stringify(values),
      })
      if (selected) {
        await apiRequest(`/admin/roles/${role.id}/permissions`, {
          token,
          method: 'PUT',
          body: JSON.stringify({ permission_ids: selectedPermissions }),
        })
      }
      newRole()
      await load()
      await refreshUser()
      setNotice('Rol y permisos guardados correctamente.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteRole(role) {
    if (!window.confirm(`¿Confirmas la eliminación del rol "${role.name}"?`)) return
    setError('')
    setNotice('')
    try {
      const result = await apiRequest(`/admin/roles/${role.id}`, { token, method: 'DELETE' })
      setNotice(result.message)
      await load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  function togglePermission(id) {
    setSelectedPermissions((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-dark">Administración</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Roles y permisos</h1>
          <p className="mt-1 text-sm text-ink-soft">Crea roles y asigna los módulos autorizados.</p>
        </div>
        <button type="button" onClick={newRole} className="rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-teal-dark">Crear rol</button>
      </div>
      {error && <div className="mt-5"><Alert>{error}</Alert></div>}
      {notice && <div className="mt-5"><Alert type="success">{notice}</Alert></div>}

      {(selected || roles.length === 0) && (
        <form onSubmit={saveRole} className="mt-6 grid gap-6 rounded-2xl border border-line bg-white p-5 shadow-sm lg:grid-cols-[.8fr_1.2fr] sm:p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-ink">{selected ? 'Editar rol' : 'Nuevo rol'}</h2>
            <label className="block space-y-1.5 text-sm font-semibold text-ink">Código
              <input className={input} required minLength={2} maxLength={40} pattern="[a-z][a-z0-9_-]*" value={values.code} onChange={(event) => setValues({ ...values, code: event.target.value })} />
            </label>
            <label className="block space-y-1.5 text-sm font-semibold text-ink">Nombre
              <input className={input} required minLength={2} maxLength={80} value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} />
            </label>
            <label className="block space-y-1.5 text-sm font-semibold text-ink">Descripción
              <textarea className={input} maxLength={250} rows={3} value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input type="checkbox" checked={values.is_active} onChange={(event) => setValues({ ...values, is_active: event.target.checked })} className="h-4 w-4 accent-teal-dark" />
              Rol activo
            </label>
          </div>
          <div>
            {selected ? (
              <>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-soft">Permisos asignados</h3>
                <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-line p-4">
                  {permissions.map((permission) => (
                    <label key={permission.id} className="flex items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                      <input type="checkbox" checked={selectedPermissions.includes(permission.id)} onChange={() => togglePermission(permission.id)} className="mt-1 h-4 w-4 accent-teal-dark" />
                      <span><span className="block text-sm font-semibold text-ink">{permission.name}</span><span className="block text-xs text-ink-soft">{permission.code}</span></span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-ink-soft">Guarda el rol primero. Después podrás asignar permisos desde el botón “Editar”.</div>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className="rounded-xl bg-teal-dark px-5 py-2.5 text-sm font-bold text-white hover:bg-ink disabled:opacity-60">{saving ? 'Guardando…' : 'Guardar rol y permisos'}</button>
              {selected && <button type="button" onClick={newRole} className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink">Cancelar</button>}
            </div>
          </div>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        {loading ? <p className="p-6 text-sm text-ink-soft">Cargando roles…</p> : (
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-ink-soft"><tr><th className="px-4 py-3">Rol</th><th className="px-4 py-3">Código</th><th className="px-4 py-3">Permisos</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead>
            <tbody className="divide-y divide-line">
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="px-4 py-3 font-semibold text-ink">{role.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{role.code}</td>
                  <td className="px-4 py-3 text-ink-soft">{role.permission_codes.length}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${role.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>{role.is_active ? 'Activo' : 'Inactivo'}</span></td>
                  <td className="px-4 py-3 text-right"><div className="inline-flex gap-2"><button type="button" onClick={() => editRole(role)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold hover:bg-slate-100">Editar</button><button type="button" onClick={() => deleteRole(role)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Eliminar</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
