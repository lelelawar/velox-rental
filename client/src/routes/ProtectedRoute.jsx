import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (requireAdmin && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  if (!requireAdmin && user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />

  return children
}

export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace />
  }
  return children
}
