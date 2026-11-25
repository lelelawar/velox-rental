import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Search } from 'lucide-react'
import { bookingAPI } from '../../services/api'
import { formatCurrency, formatDateShort } from '../../utils/helpers'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, EmptyState, Pagination, ConfirmDialog } from '../../components/common/UI'
import { BookingStatusBadge, PaymentStatusBadge } from '../../components/common/StatusBadge'
import toast from 'react-hot-toast'

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 })
  const [cancelTarget, setCancelTarget] = useState(null)

  const fetchBookings = useCallback(() => {
    setLoading(true)
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
    bookingAPI.getAll(params)
      .then(res => {
        setBookings(res.data.data || [])
        setMeta(res.data.meta)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const handleCancel = async () => {
    if (!cancelTarget) return
    try {
      await bookingAPI.cancel(cancelTarget.id)
      toast.success('Pemesanan berhasil dibatalkan')
      setCancelTarget(null)
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membatalkan pemesanan')
    }
  }

  return (
    <DashboardLayout title="Pemesanan Saya" subtitle="Kelola dan pantau semua riwayat penyewaan Anda">
      <div className="space-y-6">
        {/* Filters */}
        <div className="card p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={filters.search}
              onChange={e => setFilters(p => ({ ...p, search: e.target.value, page: 1 }))}
              placeholder="Cari kode pemesanan (VLX-...)..."
              className="input-field pl-10 py-2.5"
            />
          </div>
          <select
            value={filters.status}
            onChange={e => setFilters(p => ({ ...p, status: e.target.value, page: 1 }))}
            className="input-field sm:w-48 py-2.5"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="CONFIRMED">Dikonfirmasi</option>
            <option value="ACTIVE">Aktif</option>
            <option value="COMPLETED">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>

        {/* List */}
        {loading ? (
          <LoadingSpinner text="Memuat pemesanan..." />
        ) : bookings.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={BookOpen}
              title="Belum ada pemesanan"
              description="Tidak ada pemesanan yang sesuai dengan filter."
              action={<Link to="/vehicles" className="btn-primary text-sm">Sewa Kendaraan</Link>}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b.id} className="card flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={b.vehicle?.images?.[0]?.url || `https://placehold.co/120x80/e2e8f0/94a3b8?text=${encodeURIComponent(b.vehicle?.name || 'Car')}`}
                    alt={b.vehicle?.name}
                    className="w-24 h-16 object-cover rounded-xl bg-gray-100 flex-shrink-0"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-gray-900">{b.bookingCode}</span>
                      <BookingStatusBadge status={b.status} />
                      {b.payment && <PaymentStatusBadge status={b.payment.status} />}
                    </div>
                    <p className="font-semibold text-gray-800">{b.vehicle?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDateShort(b.startDate)} – {formatDateShort(b.endDate)} ({b.totalDays} hari) · {b.pickupLocation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-gray-500">Total Biaya</p>
                    <p className="font-bold text-blue-600">{formatCurrency(b.totalPrice)}</p>
                  </div>
                  <div className="flex gap-2">
                    {['PENDING', 'CONFIRMED'].includes(b.status) && (
                      <button
                        onClick={() => setCancelTarget(b)}
                        className="btn-secondary text-xs py-2 px-3 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Batalkan
                      </button>
                    )}
                    <Link to={`/my-bookings/${b.id}`} className="btn-primary text-xs py-2 px-4">
                      Detail
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            <Pagination meta={meta} onPageChange={p => setFilters(prev => ({ ...prev, page: p }))} />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!cancelTarget}
        title="Batalkan Pemesanan?"
        message={`Apakah Anda yakin ingin membatalkan pemesanan ${cancelTarget?.bookingCode}?`}
        confirmText="Ya, Batalkan"
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </DashboardLayout>
  )
}
