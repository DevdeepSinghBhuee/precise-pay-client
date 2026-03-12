// src/components/layout/Navbar.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import useAuth from '../../hooks/useAuth'

const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/transactions': 'Transactions',
  '/profile':      'Profile',
}

const Navbar = ({ onMenuClick }) => {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const title     = PAGE_TITLES[location.pathname] || 'Precise-Pay'

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
    }}>

      {/* Left — Hamburger + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onMenuClick}
          className="hamburger-btn"
          style={{
            background: 'none', border: 'none',
            cursor: 'pointer', color: '#6b7280',
            display: 'flex', alignItems: 'center',
            padding: '6px', borderRadius: '8px',
          }}
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 style={{
            fontSize: '18px', fontWeight: '700',
            color: '#111827', margin: 0,
          }}>
            {title}
          </h1>
          <p style={{
            fontSize: '12px', color: '#9ca3af',
            margin: 0, marginTop: '1px',
          }}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Right — Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* Avatar → navigates to profile */}
        <button
          onClick={() => navigate('/profile')}
          title={user?.fullName}
          style={{
            width: '36px', height: '36px',
            background: '#dbeafe', borderRadius: '50%',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px', fontWeight: '700',
            color: '#2563eb', cursor: 'pointer',
            border: 'none', flexShrink: 0,
          }}
        >
          {user?.fullName?.charAt(0).toUpperCase()}
        </button>
      </div>

    </header>
  )
}

export default Navbar