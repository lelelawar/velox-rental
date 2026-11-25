import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Car, LayoutDashboard, BookOpen, CreditCard, User, LogOut,
  Menu, X, Users, BarChart3, Tag, Home, ChevronRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function DashboardLayout({ children, title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const customerNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/vehicles', label: 'Jelajahi Kendaraan', icon: Car },
    { to: '/my-bookings', label: 'Pemesanan Saya', icon: BookOpen },
    { to: '/payments', label: 'Riwayat Pembayaran', icon: CreditCard },
    { to: '/profile', label: 'Profil Saya', icon: User },
  ]

  const adminNav = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/vehicles', label: 'Kendaraan', icon: Car },
    { to: '/admin/categories', label: 'Kategori', icon: Tag },
    { to: '/admin/bookings', label: 'Pemesanan', icon: BookOpen },
    { to: '/admin/payments', label: 'Pembayaran', icon: CreditCard },
    { to: '/admin/customers', label: 'Pelanggan', icon: Users },
    { to: '/admin/reports', label: 'Laporan', icon: BarChart3 },
  ]

  const navItems = isAdmin ? adminNav : customerNav

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path || (path !== '/dashboard' && path !== '/admin/dashboard' && location.pathname.startsWith(path + '/'))

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-white">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Car className="h-5 w-5 text-white" />
          </div>
          <span>VELOX RENTAL</span>
        </Link>
        <p className="text-xs text-gray-400 mt-1.5">
          {isAdmin ? 'Panel Administrator' : 'Portal Pelanggan'}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive(to)
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Ke Beranda</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-gray-900 flex-shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-gray-900 h-full z-10">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                {title && <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>}
                {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{isAdmin ? 'Administrator' : 'Pelanggan'}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 hidden sm:block" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
