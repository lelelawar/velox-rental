import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard } from 'lucide-react'
import { paymentAPI } from '../../services/api'
import { formatCurrency, formatDateShort, getPaymentMethodLabel } from '../../utils/helpers'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, EmptyState, Pagination } from '../../components/common/UI'
import { PaymentStatusBadge } from '../../components/common/StatusBadge'

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const fetchPayments = useCallback(() => {
    setLoading(true)
    const params = { page, limit: 10 }
    if (status) params.status = status
    paymentAPI.getAll(params)
      .then(res => {
        setPayments(res.data.data || [])
        setMeta(res.data.meta)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, status])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  return (
    <DashboardLayout title="Riwayat Pembayaran" subtitle="Pantau status transaksi dan bukti pembayaran Anda">
      <div className="space-y-6">
        <div className="card p-4 flex justify-between items-center">
          <p className="text-sm text-gray-600 font-medium">Filter Status Pembayaran</p>
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="input-field w-48 py-2"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="PAID">Lunas</option>
            <option value="FAILED">Gagal</option>
            <option value="REFUNDED">Dikembalikan</option>
          </select>
        </div>

        <div className="card">
          {loading ? (
            <LoadingSpinner text="Memuat riwayat pembayaran..." />
          ) : payments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="Belum ada transaksi"
              description="Riwayat pembayaran Anda akan muncul di sini."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Kode Booking</th>
                      <th className="px-4 py-3">Kendaraan</th>
                      <th className="px-4 py-3">Metode</th>
                      <th className="px-4 py-3">Jumlah</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{p.booking?.bookingCode}</td>
                        <td className="px-4 py-3">{p.booking?.vehicle?.name}</td>
                        <td className="px-4 py-3">{getPaymentMethodLabel(p.method)}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(p.amount)}</td>
                        <td className="px-4 py-3"><PaymentStatusBadge status={p.status} /></td>
                        <td className="px-4 py-3 text-gray-500">{formatDateShort(p.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link to={`/my-bookings/${p.bookingId}`} className="text-blue-600 hover:underline font-medium">
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination meta={meta} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
