import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('access_token')

  function handleLogout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/')
  }

  if (!token) {
    navigate('/login')
    return null
  }

  return (
    <div className="container">
      <h1>×</h1>
      <p>Welcome to Delete</p>
      <p className="hint">Profile & discovery coming soon</p>
      <button onClick={handleLogout} className="logout-btn">
        Sign out
      </button>
    </div>
  )
}
