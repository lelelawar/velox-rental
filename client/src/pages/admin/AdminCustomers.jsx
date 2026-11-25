import { useState, useEffect, useCallback } from 'react'
import { Search, Users, Eye } from 'lucide-react'
import { adminAPI } from '../../services/api'
import { formatCurrency, formatDateShort } from '../../utils/helpers'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, EmptyState, Pagination, Modal } from '../../components/common/UI'
import { BookingStatusBadge } from '../../components/common/StatusBadge'
import toast from 'react-hot-toast'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', page: 1 })
  const [detail, setDetail] = useState(null)

  const fetchCustomers = useCallback(() => {
    setLoading(true)
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
    adminAPI.getCustomers(params)
      .then(res => {
        setCustomers(res.data.data || [])
        setMeta(res.data.meta)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const handleToggle = async (id) => {
    try {
      const res = await adminAPI.toggleCustomer(id)
      toast.success(res.data.message || 'Status akun diperbarui')
      fetchCustomers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status akun')
    }
  }

  const openDetail = async (id) => {
    try {
      const res = await adminAPI.getCustomerDetail(id)
      setDetail(res.data.data)
    } catch (err) {
      toast.error('Gagal memuat detail pelanggan')
    }
  }

  return (
    <DashboardLayout title="Manajemen Pelanggan" subtitle="Lihat daftar pelanggan, riwayat sewa, dan status akun">
      <div className="space-y-6">
        <div className="card p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={filters.search}
              onChange={e => setFilters(p => ({ ...p, search: e.target.value, page: 1 }))}
              placeholder="Cari nama atau email pelanggan..."
              className="input-field pl-10 py-2.5"
            />
          </div>
        </div>

        <div className="card">
          {loading ? (
            <LoadingSpinner text="Memuat data pelanggan..." />
          ) : customers.length === 0 ? (
            <EmptyState icon={Users} title="Tidak ada pelanggan" description="Belum ada pelanggan yang terdaftar." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Pelanggan</th>
                      <th className="px-4 py-3">Telepon</th>
                      <th className="px-4 py-3">Total Sewa</th>
                      <th className="px-4 py-3">Bergabung</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customers.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.email}</p>
                        </td>
                        <td className="px-4 py-3">{c.phone}</td>
                        <td className="px-4 py-3"><span className="badge-info">{c._count?.bookings || 0} kali</span></td>
                        <td className="px-4 py-3 text-gray-500">{formatDateShort(c.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span className={c.isActive ? 'badge-success' : 'badge-danger'}>
                            {c.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button onClick={() => openDetail(c.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Detail">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggle(c.id)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                                c.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'
                              }`}
                            >
                              {c.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                          </div>
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

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Detail Pelanggan" size="lg">
        {detail && (
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
              <div><p className="text-xs text-gray-500">Nama</p><p className="font-semibold">{detail.name}</p></div>
              <div><p className="text-xs text-gray-500">Email</p><p className="font-semibold">{detail.email}</p></div>
              <div><p className="text-xs text-gray-500">Telepon</p><p className="font-semibold">{detail.phone}</p></div>
              <div><p className="text-xs text-gray-500">Alamat</p><p className="font-semibold">{detail.address || '-'}</p></div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3">Riwayat Penyewaan Terbaru</h4>
              {detail.bookings?.length > 0 ? (
                <div className="space-y-2">
                  {detail.bookings.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                      <div>
                        <p className="font-semibold">{b.bookingCode} · {b.vehicle?.name}</p>
                        <p className="text-xs text-gray-500">{formatDateShort(b.startDate)} – {formatDateShort(b.endDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">{formatCurrency(b.totalPrice)}</p>
                        <BookingStatusBadge status={b.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Belum ada riwayat penyewaan.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
