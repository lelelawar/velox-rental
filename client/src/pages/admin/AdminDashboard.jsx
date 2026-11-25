import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Car, Users, BookOpen, Clock, CheckCircle2, Wallet, ChevronRight } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import { adminAPI } from '../../services/api'
import { formatCurrency, formatDateShort } from '../../utils/helpers'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, ErrorState } from '../../components/common/UI'
import { BookingStatusBadge, PaymentStatusBadge } from '../../components/common/StatusBadge'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboard = () => {
    setLoading(true)
    setError(null)
    adminAPI.dashboard()
      .then(res => setData(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Gagal memuat statistik dashboard'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchDashboard() }, [])

  const stats = data?.stats || {}

  const statCards = [
    { label: 'Total Pendapatan', value: formatCurrency(stats.totalRevenue || 0), icon: Wallet, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Kendaraan', value: stats.totalVehicles || 0, icon: Car, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Total Pelanggan', value: stats.totalCustomers || 0, icon: Users, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total Pemesanan', value: stats.totalBookings || 0, icon: BookOpen, color: 'bg-slate-100 text-slate-700' },
    { label: 'Sewa Aktif', value: stats.activeRentals || 0, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
    { label: 'Menunggu Konfirmasi', value: stats.pendingBookings || 0, icon: Clock, color: 'bg-amber-50 text-amber-600' },
  ]

  return (
    <DashboardLayout title="Dashboard Admin" subtitle="Ringkasan performa bisnis VELOX RENTAL">
      {loading ? (
        <LoadingSpinner text="Memuat statistik dashboard..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDashboard} />
      ) : (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card flex items-center gap-4">
                <div className={`p-3.5 rounded-xl ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Monthly Revenue Chart */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Pendapatan Bulanan (6 Bulan Terakhir)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.monthlyRevenue || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `Rp${(v / 1000000).toFixed(1)}jt`} />
                  <Tooltip formatter={(val) => [formatCurrency(val), 'Pendapatan']} />
                  <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Bookings & Customers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Pemesanan Terbaru</h3>
                <Link to="/admin/bookings" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                  Semua <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="space-y-3">
                {(data?.recentBookings || []).map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                    <div>
                      <p className="font-semibold text-gray-900">{b.bookingCode} · {b.vehicle?.name}</p>
                      <p className="text-xs text-gray-500">{b.user?.name} · {formatDateShort(b.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <BookingStatusBadge status={b.status} />
                      {b.payment && <PaymentStatusBadge status={b.payment.status} />}
                    </div>
                  </div>
                ))}
                {(!data?.recentBookings || data.recentBookings.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-6">Belum ada pemesanan</p>
                )}
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Pelanggan Terbaru</h3>
                <Link to="/admin/customers" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                  Semua <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="space-y-3">
                {(data?.recentCustomers || []).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                        {c.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.email}</p>
                      </div>
                    </div>
                    <span className={c.isActive ? 'badge-success' : 'badge-danger'}>
                      {c.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                ))}
                {(!data?.recentCustomers || data.recentCustomers.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-6">Belum ada pelanggan</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
