import { useState, useEffect, useCallback } from 'react'
import { Search, BookOpen, Eye } from 'lucide-react'
import { adminAPI, bookingAPI } from '../../services/api'
import { formatCurrency, formatDateShort, getPaymentMethodLabel } from '../../utils/helpers'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, EmptyState, Pagination, Modal } from '../../components/common/UI'
import { BookingStatusBadge, PaymentStatusBadge } from '../../components/common/StatusBadge'
import toast from 'react-hot-toast'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 })
  const [selected, setSelected] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const fetchBookings = useCallback(() => {
    setLoading(true)
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
    adminAPI.getAllBookings(params)
      .then(res => {
        setBookings(res.data.data || [])
        setMeta(res.data.meta)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const updateStatus = async (id, status, reason = undefined) => {
    try {
      await bookingAPI.updateStatus(id, { status, rejectionReason: reason })
      toast.success('Status pemesanan diperbarui')
      setRejectModal(null)
      setRejectionReason('')
      setSelected(null)
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui status')
    }
  }

  return (
    <DashboardLayout title="Manajemen Pemesanan" subtitle="Kelola persetujuan, pengambilan, dan pengembalian unit">
      <div className="space-y-6">
        <div className="card p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={filters.search}
              onChange={e => setFilters(p => ({ ...p, search: e.target.value, page: 1 }))}
              placeholder="Cari kode booking atau nama pelanggan..."
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
            <option value="REJECTED">Ditolak</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>

        <div className="card">
          {loading ? (
            <LoadingSpinner text="Memuat daftar pemesanan..." />
          ) : bookings.length === 0 ? (
            <EmptyState icon={BookOpen} title="Tidak ada pemesanan" description="Belum ada data pemesanan yang sesuai." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Kode</th>
                      <th className="px-4 py-3">Pelanggan</th>
                      <th className="px-4 py-3">Kendaraan</th>
                      <th className="px-4 py-3">Periode</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Pembayaran</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{b.bookingCode}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{b.user?.name}</p>
                          <p className="text-xs text-gray-500">{b.user?.email}</p>
                        </td>
                        <td className="px-4 py-3">{b.vehicle?.name}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {formatDateShort(b.startDate)} – {formatDateShort(b.endDate)} ({b.totalDays}h)
                        </td>
                        <td className="px-4 py-3 font-semibold text-blue-600">{formatCurrency(b.totalPrice)}</td>
                        <td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td>
                        <td className="px-4 py-3">
                          {b.payment ? <PaymentStatusBadge status={b.payment.status} /> : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelected(b)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg inline-flex items-center gap-1 text-xs font-semibold"
                          >
                            <Eye className="h-4 w-4" /> Kelola
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination meta={meta} onPageChange={p => setFilters(prev => ({ ...prev, page: p }))} />
            </>
          )}
        </div>
      </div>

      {/* Booking Detail & Workflow Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Kelola Pemesanan ${selected?.bookingCode || ''}`}>
        {selected && (
          <div className="space-y-5 text-sm">
            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">Pelanggan</span><span className="font-semibold">{selected.user?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Kendaraan</span><span className="font-semibold">{selected.vehicle?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Periode</span><span className="font-semibold">{formatDateShort(selected.startDate)} – {formatDateShort(selected.endDate)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Lokasi Ambil</span><span className="font-semibold">{selected.pickupLocation}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Biaya</span><span className="font-bold text-blue-600">{formatCurrency(selected.totalPrice)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Metode Bayar</span><span>{getPaymentMethodLabel(selected.payment?.method)}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500">Status</span><BookingStatusBadge status={selected.status} /></div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end pt-2 border-t border-gray-100">
              {selected.status === 'PENDING' && (
                <>
                  <button onClick={() => setRejectModal(selected)} className="btn-danger text-xs py-2 px-4">Tolak</button>
                  <button onClick={() => updateStatus(selected.id, 'CONFIRMED')} className="btn-primary text-xs py-2 px-4">Setujui (Konfirmasi)</button>
                </>
              )}
              {selected.status === 'CONFIRMED' && (
                <>
                  <button onClick={() => updateStatus(selected.id, 'CANCELLED')} className="btn-secondary text-xs py-2 px-4 text-red-600">Batalkan</button>
                  <button onClick={() => updateStatus(selected.id, 'ACTIVE')} className="btn-primary text-xs py-2 px-4">Tandai Diambil (Aktif)</button>
                </>
              )}
              {selected.status === 'ACTIVE' && (
                <button onClick={() => updateStatus(selected.id, 'COMPLETED')} className="btn-primary text-xs py-2 px-4">Tandai Dikembalikan (Selesai)</button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Reason Modal */}
      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Alasan Penolakan">
        <div className="space-y-4">
          <textarea
            rows={3}
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            placeholder="Masukkan alasan penolakan pemesanan..."
            className="input-field"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setRejectModal(null)} className="btn-secondary text-sm py-2 px-4">Batal</button>
            <button onClick={() => updateStatus(rejectModal.id, 'REJECTED', rejectionReason)} className="btn-danger text-sm py-2 px-4">
              Tolak Pemesanan
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
