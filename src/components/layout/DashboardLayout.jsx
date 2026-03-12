// src/components/layout/DashboardLayout.jsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh',
                  backgroundColor: '#f4f6f9' }}>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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