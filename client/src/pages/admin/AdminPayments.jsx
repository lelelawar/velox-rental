import { useState, useEffect, useCallback } from 'react'
import { CreditCard, Eye } from 'lucide-react'
import { paymentAPI } from '../../services/api'
import { formatCurrency, formatDateShort, getPaymentMethodLabel } from '../../utils/helpers'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, EmptyState, Pagination, Modal } from '../../components/common/UI'
import { PaymentStatusBadge } from '../../components/common/StatusBadge'
import toast from 'react-hot-toast'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

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

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await paymentAPI.updateStatus(id, { status: newStatus })
      toast.success('Status pembayaran berhasil diperbarui')
      setSelected(null)
      fetchPayments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui status pembayaran')
    }
  }

  return (
    <DashboardLayout title="Manajemen Pembayaran" subtitle="Verifikasi bukti transfer dan kelola status transaksi">
      <div className="space-y-6">
        <div className="card p-4 flex justify-between items-center">
          <p className="text-sm font-medium text-gray-600">Filter Status</p>
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
            <LoadingSpinner text="Memuat transaksi..." />
          ) : payments.length === 0 ? (
            <EmptyState icon={CreditCard} title="Belum ada pembayaran" description="Belum ada transaksi pembayaran." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Kode Booking</th>
                      <th className="px-4 py-3">Pelanggan</th>
                      <th className="px-4 py-3">Metode</th>
                      <th className="px-4 py-3">Jumlah</th>
                      <th className="px-4 py-3">Bukti</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{p.booking?.bookingCode}</td>
                        <td className="px-4 py-3">{p.booking?.user?.name}</td>
                        <td className="px-4 py-3">{getPaymentMethodLabel(p.method)}</td>
                        <td className="px-4 py-3 font-semibold text-blue-600">{formatCurrency(p.amount)}</td>
                        <td className="px-4 py-3">
                          <span className="badge-gray">{p.proofs?.length || 0} file</span>
                        </td>
                        <td className="px-4 py-3"><PaymentStatusBadge status={p.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelected(p)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg inline-flex items-center gap-1 text-xs font-semibold"
                          >
                            <Eye className="h-4 w-4" /> Tinjau
                          </button>
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

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Verifikasi Pembayaran (Simulasi)">
        {selected && (
          <div className="space-y-5 text-sm">
            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">Kode Booking</span><span className="font-semibold">{selected.booking?.bookingCode}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pelanggan</span><span className="font-semibold">{selected.booking?.user?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Kendaraan</span><span className="font-semibold">{selected.booking?.vehicle?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Metode</span><span>{getPaymentMethodLabel(selected.method)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold text-blue-600">{formatCurrency(selected.amount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tanggal</span><span>{formatDateShort(selected.createdAt)}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500">Status</span><PaymentStatusBadge status={selected.status} /></div>
            </div>

            {selected.proofs?.length > 0 ? (
              <div>
                <p className="font-semibold text-gray-800 mb-2">Bukti Pembayaran Terunggah</p>
                <div className="grid grid-cols-2 gap-3">
                  {selected.proofs.map(pr => (
                    <a key={pr.id} href={pr.fileUrl} target="_blank" rel="noreferrer" className="block border border-gray-200 rounded-xl overflow-hidden">
                      <img src={pr.fileUrl} alt="Bukti" className="w-full h-32 object-cover" />
                      {pr.notes && <p className="p-2 text-xs text-gray-600">{pr.notes}</p>}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">Belum ada bukti pembayaran yang diunggah.</p>
            )}

            <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-gray-100">
              {selected.status === 'PENDING' && (
                <>
                  <button onClick={() => handleStatusUpdate(selected.id, 'FAILED')} className="btn-danger text-xs py-2 px-4">Tolak (Gagal)</button>
                  <button onClick={() => handleStatusUpdate(selected.id, 'PAID')} className="btn-primary text-xs py-2 px-4">Konfirmasi Lunas</button>
                </>
              )}
              {selected.status === 'PAID' && (
                <button onClick={() => handleStatusUpdate(selected.id, 'REFUNDED')} className="btn-secondary text-xs py-2 px-4 text-amber-700 border-amber-200">
                  Proses Refund (Simulasi)
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
