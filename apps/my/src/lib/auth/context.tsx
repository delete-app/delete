import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { fetchClient } from '../api/client'
import { STORAGE_KEYS } from '../config'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  accessToken: string | null
}

interface AuthContextType extends AuthState {
  login: (accessToken: string, refreshToken: string) => void
  logout: () => void
  refreshAccessToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    accessToken: null,
  })

  const login = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    setState({
      isAuthenticated: true,
      isLoading: false,
      accessToken,
    })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    setState({
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
    })
  }, [])

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    if (!refreshToken) {
      logout()
      return false
    }

    try {
      const { data, error } = await fetchClient.POST('/v1/auth/refresh', {
        body: { refresh_token: refreshToken },
      })

      if (error || !data) {
        logout()
        return false
      }

      login(data.access_token, data.refresh_token)
      return true
    } catch {
      logout()
      return false
    }
  }, [login, logout])

  // Check for existing token on mount
  useEffect(() => {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (accessToken) {
      setState({
        isAuthenticated: true,
        isLoading: false,
        accessToken,
      })
    } else {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  // Set up token refresh interval (refresh 5 minutes before expiry, assuming 30 min token)
  useEffect(() => {
    if (!state.isAuthenticated) return

    const refreshInterval = setInterval(() => {
      refreshAccessToken()
    }, 25 * 60 * 1000) // 25 minutes

    return () => clearInterval(refreshInterval)
  }, [state.isAuthenticated, refreshAccessToken])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
