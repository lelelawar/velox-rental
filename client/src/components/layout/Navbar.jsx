import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Car, User, LogOut, LayoutDashboard, BookOpen } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Car className="h-5 w-5 text-white" />
            </div>
            VELOX RENTAL
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>Beranda</Link>
            <Link to="/vehicles" className={`text-sm font-medium transition-colors ${isActive('/vehicles') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>Kendaraan</Link>
            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <Link to="/admin/dashboard" className="btn-primary text-sm py-2 px-4">Dashboard Admin</Link>
                ) : (
                  <>
                    <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1.5">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link to="/my-bookings" className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" /> Pemesanan
                    </Link>
                  </>
                )}
                <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                  <Link to={isAdmin ? '/profile' : '/profile'} className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{user.name.split(' ')[0]}</span>
                  </Link>
                  <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Logout">
                    <LogOut className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Masuk</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Daftar</Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link to="/" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setIsOpen(false)}>Beranda</Link>
          <Link to="/vehicles" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setIsOpen(false)}>Kendaraan</Link>
          {user ? (
            <>
              {!isAdmin && <Link to="/dashboard" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setIsOpen(false)}>Dashboard</Link>}
              {!isAdmin && <Link to="/my-bookings" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setIsOpen(false)}>Pemesanan Saya</Link>}
              {isAdmin && <Link to="/admin/dashboard" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setIsOpen(false)}>Admin Dashboard</Link>}
              <Link to="/profile" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setIsOpen(false)}>Profil</Link>
              <button onClick={() => { handleLogout(); setIsOpen(false) }} className="block text-sm font-medium text-red-600 py-2 w-full text-left">Keluar</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setIsOpen(false)}>Masuk</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4 block text-center" onClick={() => setIsOpen(false)}>Daftar</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
