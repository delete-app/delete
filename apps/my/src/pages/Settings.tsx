import { $api } from '../lib/api/client'
import { useAuth } from '../lib/auth/context'

export default function Settings() {
  const { logout } = useAuth()
  const { data: user, isLoading, error } = $api.useQuery('get', '/v1/users/me')

  if (isLoading) {
    return (
      <div className="settings">
        <div className="settings-loading">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="settings">
        <div className="error">Failed to load profile</div>
      </div>
    )
  }

  return (
    <div className="settings">
      <h2>Settings</h2>

      <section className="settings-section">
        <h3>Account</h3>
        <div className="settings-item">
          <label>Email</label>
          <span>{user?.email}</span>
        </div>
        <div className="settings-item">
          <label>Name</label>
          <span>{user?.name || 'Not set'}</span>
        </div>
        <div className="settings-item">
          <label>Member since</label>
          <span>
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : '-'}
          </span>
        </div>
      </section>

      <section className="settings-section">
        <h3>Danger Zone</h3>
        <button className="btn-danger" onClick={logout}>
          Sign out
        </button>
      </section>
    </div>
  )
}
