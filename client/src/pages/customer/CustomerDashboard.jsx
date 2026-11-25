import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Car, CheckCircle2, Clock, CreditCard, ChevronRight } from 'lucide-react'
import { bookingAPI, paymentAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency, formatDateShort } from '../../utils/helpers'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, EmptyState } from '../../components/common/UI'
import { BookingStatusBadge, PaymentStatusBadge } from '../../components/common/StatusBadge'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      bookingAPI.getAll({ limit: 50 }),
      paymentAPI.getAll({ limit: 50 })
    ])
      .then(([bRes, pRes]) => {
        setBookings(bRes.data.data || [])
        setPayments(pRes.data.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalBookings = bookings.length
  const activeRentals = bookings.filter(b => b.status === 'ACTIVE').length
  const completedRentals = bookings.filter(b => b.status === 'COMPLETED').length
  const pendingPayments = payments.filter(p => p.status === 'PENDING').length

  const stats = [
    { label: 'Total Pemesanan', value: totalBookings, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
    { label: 'Sedang Berjalan', value: activeRentals, icon: Car, color: 'bg-green-50 text-green-600' },
    { label: 'Selesai', value: completedRentals, icon: CheckCircle2, color: 'bg-gray-100 text-gray-700' },
    { label: 'Menunggu Pembayaran', value: pendingPayments, icon: Clock, color: 'bg-amber-50 text-amber-600' },
  ]

  return (
    <DashboardLayout
      title={`Halo, ${user?.name?.split(' ')[0] || 'Pelanggan'}!`}
      subtitle="Ringkasan aktivitas penyewaan kendaraan Anda"
    >
      {loading ? (
        <LoadingSpinner text="Memuat dashboard..." />
      ) : (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gray-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold mb-1">Siap untuk perjalanan berikutnya?</h2>
              <p className="text-gray-300 text-sm">Jelajahi armada terbaik kami dan pesan kendaraan dengan mudah.</p>
            </div>
            <Link to="/vehicles" className="btn-primary whitespace-nowrap text-center text-sm py-2.5 px-5">
              Jelajahi Kendaraan
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card flex items-center gap-4">
                <div className={`p-3 rounded-xl ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Bookings */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Pemesanan Terbaru</h3>
              <Link to="/my-bookings" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                Lihat Semua <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {bookings.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Belum ada pemesanan"
                description="Anda belum memiliki riwayat pemesanan kendaraan."
                action={<Link to="/vehicles" className="btn-primary text-sm">Cari Kendaraan</Link>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Kode</th>
                      <th className="px-4 py-3">Kendaraan</th>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Pembayaran</th>
                      <th className="px-4 py-3 rounded-r-lg text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.slice(0, 5).map(b => (
                      <tr key={b.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{b.bookingCode}</td>
                        <td className="px-4 py-3">{b.vehicle?.name}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {formatDateShort(b.startDate)} - {formatDateShort(b.endDate)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(b.totalPrice)}</td>
                        <td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td>
                        <td className="px-4 py-3">
                          {b.payment ? <PaymentStatusBadge status={b.payment.status} /> : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link to={`/my-bookings/${b.id}`} className="text-blue-600 hover:underline font-medium">
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Payment Link */}
          {pendingPayments > 0 && (
            <div className="card bg-amber-50 border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-amber-900 text-sm">Anda memiliki {pendingPayments} pembayaran menunggu</p>
                  <p className="text-xs text-amber-700">Segera unggah bukti pembayaran agar pemesanan dapat dikonfirmasi.</p>
                </div>
              </div>
              <Link to="/payments" className="btn-primary text-sm py-2 px-4 whitespace-nowrap text-center">
                Lihat Pembayaran
              </Link>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
