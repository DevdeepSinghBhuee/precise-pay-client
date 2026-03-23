// src/components/layout/Navbar.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, CheckCheck } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import useAuth from '../../hooks/useAuth'
import useNotifications from '../../hooks/useNotifications'
// eslint-disable-next-line no-unused-vars
import { formatDate } from '../../utils/formatters'

const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/transactions': 'Transactions',
  '/budgets':      'Budget Goals',
  '/profile':      'Profile',
}

const TYPE_STYLES = {
  danger:  { bg: '#fef2f2', color: '#ef4444', dot: '#ef4444' },
  warning: { bg: '#fffbeb', color: '#f59e0b', dot: '#f59e0b' },
  success: { bg: '#f0fdf4', color: '#16a34a', dot: '#16a34a' },
  info:    { bg: '#eff6ff', color: '#2563eb', dot: '#2563eb' },
}

const Navbar = ({ onMenuClick }) => {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const title     = PAGE_TITLES[location.pathname] || 'Precise-Pay'

  const { notifications, loading, unreadCount, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleOpen = () => {
    setOpen((prev) => !prev)
    if (!open && unreadCount > 0) markAllRead()
  }

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--navbar-bg)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      boxShadow: '0 1px 8px var(--shadow)',
    }}>

      {/* Left */}
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
            color: 'var(--text-primary)', margin: 0,
          }}>
            {title}
          </h1>
          <p style={{
            fontSize: '12px', color: 'var(--text-muted)',
            margin: 0, marginTop: '1px',
          }}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* Notification Bell */}
        <div ref={ref} style={{ position: 'relative' }}>
          <button
            onClick={handleOpen}
            style={{
              background: open ? '#f3f4f6' : 'none',
              border: 'none', cursor: 'pointer',
              color: '#6b7280', display: 'flex',
              alignItems: 'center', padding: '8px',
              borderRadius: '10px', position: 'relative',
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '5px', right: '5px',
                width: '16px', height: '16px',
                background: '#ef4444', borderRadius: '50%',
                border: '2px solid white',
                fontSize: '9px', fontWeight: '700',
                color: 'white', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div style={{
              position: 'absolute', top: '48px', right: 0,
              width: '360px', background: 'var(--bg-card)',
              borderRadius: '16px', border: '1px solid var(--border)',
              boxShadow: '0 8px 32px var(--shadow-md)',
              zIndex: 100, overflow: 'hidden',
            }}>

              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <h3 style={{
                    fontSize: '15px', fontWeight: '700',
                    color: 'var(--text-primary)', margin: 0,
                  }}>
                    Notifications
                  </h3>
                  <p style={{
                    fontSize: '12px', color: 'var(--text-muted)',
                    margin: 0, marginTop: '2px',
                  }}>
                    {notifications.length} total
                  </p>
                </div>
                <button
                  onClick={markAllRead}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#2563eb',
                    fontSize: '12px', fontWeight: '600',
                  }}
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              </div>

              {/* List */}
              <div style={{
                maxHeight: '380px', overflowY: 'auto',
              }}>
                {loading ? (
                  <div style={{
                    padding: '40px', textAlign: 'center',
                    color: 'var(--text-muted)', fontSize: '14px',
                  }}>
                    Loading...
                  </div>
                ) : notifications.length === 0 ? (
                  <div style={{
                    padding: '40px', textAlign: 'center',
                    color: 'var(--text-muted)',
                  }}>
                    <Bell size={32} style={{
                      margin: '0 auto 12px', opacity: 0.2,
                      display: 'block',
                    }} />
                    <p style={{ fontSize: '14px', margin: 0 }}>
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const style = TYPE_STYLES[n.type] || TYPE_STYLES.info
                    return (
                      <div key={n.id} style={{
                        display: 'flex', gap: '12px',
                        padding: '14px 20px',
                        borderBottom: '1px solid var(--border)',
                        background: n.read ? 'var(--bg-card)' : 'var(--bg-hover)',
                        transition: 'background 0.15s',
                      }}>
                        {/* Dot */}
                        <div style={{
                          width: '8px', height: '8px',
                          borderRadius: '50%',
                          background: n.read ? '#e5e7eb' : style.dot,
                          flexShrink: 0, marginTop: '5px',
                        }} />

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '3px',
                          }}>
                            <p style={{
                              fontSize: '13px', fontWeight: '600',
                              color: 'var(--text-primary)', margin: 0,
                            }}>
                              {n.title}
                            </p>
                            <span style={{
                              fontSize: '11px', color: 'var(--text-muted)',
                              flexShrink: 0, marginLeft: '8px',
                            }}>
                              {n.time}
                            </span>
                          </div>
                          <p style={{
                            fontSize: '12px', color: 'var(--text-secondary)',
                            margin: 0, lineHeight: '1.5',
                          }}>
                            {n.message}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--border)',
                textAlign: 'center',
              }}>
                <button
                  onClick={() => {
                    navigate('/budgets')
                    setOpen(false)
                  }}
                  style={{
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#2563eb',
                    fontSize: '13px', fontWeight: '600',
                  }}
                >
                  View Budget Goals →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
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