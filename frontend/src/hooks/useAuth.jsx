import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/api.js'

const AuthContext = createContext(null)

function storedToken() {
  return localStorage.getItem('sur-digital-token') || sessionStorage.getItem('sur-digital-token')
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(storedToken)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(storedToken()))
  const [sessionError, setSessionError] = useState('')

  const refreshUser = useCallback(async () => {
    const currentToken = storedToken()
    if (!currentToken) {
      setToken(null)
      setUser(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const currentUser = await authApi.me(currentToken)
      setToken(currentToken)
      setUser(currentUser)
      setSessionError('')
    } catch (error) {
      setSessionError(error.message)
      if (error.status === 401) {
        localStorage.removeItem('sur-digital-token')
        sessionStorage.removeItem('sur-digital-token')
        setToken(null)
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) refreshUser()
    else setLoading(false)
  }, [token, refreshUser])

  const signIn = useCallback(async (credentials, remember) => {
    const result = await authApi.login(credentials)
    localStorage.removeItem('sur-digital-token')
    sessionStorage.removeItem('sur-digital-token')
    const storage = remember ? localStorage : sessionStorage
    storage.setItem('sur-digital-token', result.access_token)
    setToken(result.access_token)
    setUser(result.user)
    setSessionError('')
    return result.user
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem('sur-digital-token')
    sessionStorage.removeItem('sur-digital-token')
    setToken(null)
    setUser(null)
    setSessionError('')
  }, [])

  const value = useMemo(
    () => ({ token, user, loading, sessionError, signIn, signOut, refreshUser }),
    [token, user, loading, sessionError, signIn, signOut, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.')
  return context
}
