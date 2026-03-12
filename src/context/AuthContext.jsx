// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react'
import authApi from '../api/auth.api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)
export { AuthContext }

const clearAuthStorage = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  const clearAuth = useCallback(() => {
    clearAuthStorage()
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token')
      const storedUser  = localStorage.getItem('user')

      if (storedToken && storedUser) {
        try {
          setToken(storedToken)
          const response = await authApi.getProfile()
          setUser(response.data.data.user)
        } catch {
          clearAuth()
        }
      }
      setLoading(false)
    }

    restoreSession()
  }, [clearAuth])

  const login = useCallback(async (email, password) => {
    const response = await authApi.login({ email, password })
    const { token: newToken, user: newUser } = response.data.data
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    toast.success(`Welcome back, ${newUser.fullName.split(' ')[0]}! 👋`)
    return newUser
  }, [])

  const register = useCallback(async (userData) => {
    const response = await authApi.register(userData)
    const { token: newToken, user: newUser } = response.data.data
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    toast.success(`Account created! Welcome, ${newUser.fullName.split(' ')[0]}! 🎉`)
    return newUser
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    toast.success('Logged out successfully.')
  }, [clearAuth])

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }, [])

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}