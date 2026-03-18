// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

// Pages
import Login        from './pages/Login'
import Register     from './pages/Register'
import Dashboard    from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Profile      from './pages/Profile'
import Budgets      from './pages/Budgets'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword  from './pages/ResetPassword'

// Layout
import DashboardLayout from './components/layout/DashboardLayout'

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password"        element={<ForgotPassword />} />
        <Route path="/reset-password/:token"  element={<ResetPassword />} />

        {/* Protected Routes — wrapped in DashboardLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets"      element={<Budgets />} />
            <Route path="/profile"      element={<Profile />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App