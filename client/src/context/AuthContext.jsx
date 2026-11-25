import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('velox_token')
    const savedUser = localStorage.getItem('velox_user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      authAPI.me().then(res => {
        setUser(res.data.data)
        localStorage.setItem('velox_user', JSON.stringify(res.data.data))
      }).catch(() => {
        localStorage.removeItem('velox_token')
        localStorage.removeItem('velox_user')
        setUser(null)
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const res = await authAPI.login(credentials)
    const { user, token } = res.data.data
    localStorage.setItem('velox_token', token)
    localStorage.setItem('velox_user', JSON.stringify(user))
    setUser(user)
    return user
  }, [])

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data)
    const { user, token } = res.data.data
    localStorage.setItem('velox_token', token)
    localStorage.setItem('velox_user', JSON.stringify(user))
    setUser(user)
    return user
  }, [])

  const logout = useCallback(async () => {
    try { await authAPI.logout() } catch {}
    localStorage.removeItem('velox_token')
    localStorage.removeItem('velox_user')
    setUser(null)
  }, [])

  const isAdmin = user?.role === 'ADMIN'
  const isCustomer = user?.role === 'CUSTOMER'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isCustomer }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
