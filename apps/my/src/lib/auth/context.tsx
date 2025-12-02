import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { fetchClient } from '../api/client'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: () => void
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true, // Start loading to verify auth on mount
  })

  const login = useCallback(() => {
    // Called after successful login API call
    // Cookies are set by the server, we just update local state
    setState({
      isAuthenticated: true,
      isLoading: false,
    })
  }, [])

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to clear cookies on server
      await fetchClient.POST('/v1/auth/logout', {})
    } catch {
      // Ignore errors, still clear local state
    }
    setState({
      isAuthenticated: false,
      isLoading: false,
    })
  }, [])

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      // Try to refresh tokens - if successful, we have valid auth
      const { error } = await fetchClient.POST('/v1/auth/refresh', {})

      if (error) {
        setState({ isAuthenticated: false, isLoading: false })
        return false
      }

      setState({ isAuthenticated: true, isLoading: false })
      return true
    } catch {
      setState({ isAuthenticated: false, isLoading: false })
      return false
    }
  }, [])

  // Check auth status on mount by attempting to refresh
  useEffect(() => {
    let cancelled = false

    async function verifyAuth() {
      try {
        const { error } = await fetchClient.POST('/v1/auth/refresh', {})
        if (!cancelled) {
          setState({
            isAuthenticated: !error,
            isLoading: false,
          })
        }
      } catch {
        if (!cancelled) {
          setState({ isAuthenticated: false, isLoading: false })
        }
      }
    }

    verifyAuth()

    return () => {
      cancelled = true
    }
  }, [])

  // Set up token refresh interval (refresh 5 minutes before expiry, assuming 30 min token)
  useEffect(() => {
    if (!state.isAuthenticated) return

    const refreshInterval = setInterval(
      () => {
        checkAuth()
      },
      25 * 60 * 1000
    ) // 25 minutes

    return () => clearInterval(refreshInterval)
  }, [state.isAuthenticated, checkAuth])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        checkAuth,
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
