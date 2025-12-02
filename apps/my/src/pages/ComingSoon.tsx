import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ComingSoon() {
  const navigate = useNavigate()
  const [clicks, setClicks] = useState(0)
  const [keys, setKeys] = useState('')

  // Easter egg: click × 5 times or type "delete"
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const newKeys = (keys + e.key).slice(-6)
      setKeys(newKeys)
      if (newKeys === 'delete') {
        navigate('/login')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keys, navigate])

  function handleLogoClick() {
    const newClicks = clicks + 1
    setClicks(newClicks)
    if (newClicks >= 5) {
      navigate('/login')
    }
  }

  return (
    <div className="container">
      <h1 onClick={handleLogoClick} style={{ cursor: 'default' }}>×</h1>
      <p>Delete — coming soon</p>
      <p className="hint">my.trydelete.app</p>
    </div>
  )
}
