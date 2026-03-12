// src/components/common/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth()

  // ── Loading State ────────────────────────────────────────────────────
  // Show full-screen spinner while session is being restored.
  // Without this, the app would flash to /login on every page refresh
  // even for logged-in users.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600
                          rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">
            Loading Precise-Pay...
          </p>
        </div>
      </div>
    )
  }

  // ── Auth Check ───────────────────────────────────────────────────────
  // Not authenticated → redirect to login, replace history so the user
  // can't press back to get to the protected page.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // ── Authenticated → render child routes ──────────────────────────────
  return <Outlet />
}

export default ProtectedRoute
