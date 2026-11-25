import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Customer pages
import HomePage from './pages/customer/HomePage'
import VehiclesPage from './pages/customer/VehiclesPage'
import VehicleDetailPage from './pages/customer/VehicleDetailPage'
import BookingPage from './pages/customer/BookingPage'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import MyBookingsPage from './pages/customer/MyBookingsPage'
import BookingDetailPage from './pages/customer/BookingDetailPage'
import PaymentHistoryPage from './pages/customer/PaymentHistoryPage'
import ProfilePage from './pages/customer/ProfilePage'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminVehicles from './pages/admin/AdminVehicles'
import AdminBookings from './pages/admin/AdminBookings'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminPayments from './pages/admin/AdminPayments'
import AdminReports from './pages/admin/AdminReports'
import AdminCategories from './pages/admin/AdminCategories'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/vehicles/:id" element={<VehicleDetailPage />} />

        {/* Auth */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Customer protected */}
        <Route path="/booking/:vehicleId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
        <Route path="/my-bookings/:id" element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><PaymentHistoryPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/vehicles" element={<ProtectedRoute requireAdmin><AdminVehicles /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute requireAdmin><AdminBookings /></ProtectedRoute>} />
        <Route path="/admin/customers" element={<ProtectedRoute requireAdmin><AdminCustomers /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute requireAdmin><AdminPayments /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute requireAdmin><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute requireAdmin><AdminCategories /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
