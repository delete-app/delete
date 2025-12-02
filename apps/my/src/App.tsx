import { Routes, Route } from 'react-router-dom'
import ComingSoon from './pages/ComingSoon'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'

function App() {
  const token = localStorage.getItem('access_token')

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/*" element={token ? <Dashboard /> : <ComingSoon />} />
    </Routes>
  )
}

export default App
