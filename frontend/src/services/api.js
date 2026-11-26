const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '')

export async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers || {})
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error('No fue posible conectar con el servidor. Verifica que el backend esté iniciado.')
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const detail = payload?.detail
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(' ')
      : detail || payload?.message
    const error = new Error(message || `La solicitud falló (${response.status}).`)
    error.status = response.status
    throw error
  }
  return payload
}

export const authApi = {
  register: (data) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: (token) => apiRequest('/auth/me', { token }),
  requestPasswordReset: (email) =>
    apiRequest('/auth/password-reset/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  confirmPasswordReset: (token, new_password) =>
    apiRequest('/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify({ token, new_password }),
    }),
}

export const servicesApi = {
  publicList: () => apiRequest('/services'),
}
