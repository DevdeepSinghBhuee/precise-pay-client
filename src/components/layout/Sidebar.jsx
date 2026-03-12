// src/components/layout/Sidebar.jsx
import { NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  User,
  LogOut,
  TrendingUp,
  X,
  Wallet,
} from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { formatCurrency } from '../../utils/formatters'

const NAV_ITEMS = [
  {
    path:  '/dashboard',
    label: 'Dashboard',
    icon:  LayoutDashboard,
  },
  {
    path:  '/transactions',
    label: 'Transactions',
    icon:  ArrowLeftRight,
  },
  {
    path:  '/profile',
    label: 'Profile',
    icon:  User,
  },
]

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* ── Mobile Backdrop ───────────────────────────────────────────── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
          onClick={onClose}
        />
      )}

      {/* ── Sidebar Panel ─────────────────────────────────────────────── */}
      <aside
        style={{
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          width: '260px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #f3f4f6',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          boxShadow: '4px 0 24px rgba(0,0,0,0.06)',
        }}
        className="sidebar-panel"
      >

        {/* ── Logo ────────────────────────────────────────────────────── */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px',
                background: '#2563eb', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TrendingUp color="white" size={20} />
              </div>
              <span style={{
                fontSize: '18px', fontWeight: '800', color: '#111827',
              }}>
                Precise-Pay
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9ca3af', padding: '4px',
            }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Balance Card ─────────────────────────────────────────────── */}
        <div style={{ padding: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            borderRadius: '14px',
            padding: '16px',
            color: 'white',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: '8px', marginBottom: '8px',
            }}>
              <Wallet size={16} style={{ opacity: 0.8 }} />
              <span style={{
                fontSize: '12px', opacity: 0.8, fontWeight: '500',
              }}>
                Current Balance
              </span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: '700' }}>
              {formatCurrency(user?.balance || 0)}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
              {user?.fullName}
            </div>
          </div>
        </div>

        {/* ── Navigation ───────────────────────────────────────────────── */}
        <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
          <p style={{
            fontSize: '11px', fontWeight: '600', color: '#9ca3af',
            textTransform: 'uppercase', letterSpacing: '0.8px',
            padding: '8px 8px 12px',
          }}>
            Menu
          </p>

          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 12px',
                borderRadius: '10px',
                marginBottom: '4px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? '#2563eb' : '#4b5563',
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* ── Logout ───────────────────────────────────────────────────── */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #f3f4f6',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '10px', marginBottom: '12px',
            padding: '10px',
            background: '#f9fafb',
            borderRadius: '10px',
          }}>
            <div style={{
              width: '36px', height: '36px',
              background: '#dbeafe', borderRadius: '50%',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px', fontWeight: '700',
              color: '#2563eb', flexShrink: 0,
            }}>
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{
                fontSize: '13px', fontWeight: '600',
                color: '#111827', margin: 0,
                whiteSpace: 'nowrap', overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user?.fullName}
              </p>
              <p style={{
                fontSize: '11px', color: '#9ca3af', margin: 0,
                whiteSpace: 'nowrap', overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: '10px', padding: '10px 12px',
              background: 'none', border: '1px solid #fee2e2',
              borderRadius: '10px', cursor: 'pointer',
              color: '#ef4444', fontSize: '14px', fontWeight: '500',
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

      </aside>
    </>
  )
}

export default Sidebar