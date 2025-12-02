import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth/context'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated, logout } = useAuth()
  const location = useLocation()

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <Link to="/" className="logo">
          ×
        </Link>
        {isAuthenticated && (
          <nav className="nav">
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
              Home
            </Link>
            <Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>
              Settings
            </Link>
            <button onClick={logout} className="nav-logout">
              Sign out
            </button>
          </nav>
        )}
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}
