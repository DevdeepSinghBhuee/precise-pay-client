// src/components/layout/DashboardLayout.jsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import useDarkMode from '../../hooks/useDarkMode'

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isDark, toggle } = useDarkMode()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', transition: 'background 0.3s ease' }}>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isDark={isDark}
        onToggleDark={toggle}
      />

      {/* Main content area — offset by sidebar width on desktop */}
      <div
        className="main-content"
        style={{ flex: 1, display: 'flex',
                 flexDirection: 'column', minWidth: 0 }}
      >
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

    </div>
  )
}

export default DashboardLayout