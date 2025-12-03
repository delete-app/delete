import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth/context'
import { Loading } from './ui'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireProfileComplete?: boolean
}

export function ProtectedRoute({ children, requireProfileComplete = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Redirect to onboarding if profile is incomplete (unless we're already there)
  if (
    requireProfileComplete &&
    user &&
    !user.profile_complete &&
    location.pathname !== '/onboarding'
  ) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
