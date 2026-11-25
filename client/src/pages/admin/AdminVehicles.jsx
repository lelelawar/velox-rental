import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, Car } from 'lucide-react'
import { vehicleAPI, categoryAPI } from '../../services/api'
import { formatCurrency, getTransmissionLabel, getFuelLabel } from '../../utils/helpers'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, EmptyState, Pagination, Modal, ConfirmDialog } from '../../components/common/UI'
import { VehicleStatusBadge } from '../../components/common/StatusBadge'
import toast from 'react-hot-toast'

const initialForm = {
  name: '', brand: '', model: '', year: new Date().getFullYear(), color: '',
  licensePlate: '', description: '', pricePerDay: '', transmission: 'AUTOMATIC',
  fuelType: 'BENSIN', capacity: 5, status: 'AVAILABLE', location: '', features: '', categoryId: ''
}

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([])
  const [categories, setCategories] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 })

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [files, setFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    categoryAPI.getAll().then(res => setCategories(res.data.data || [])).catch(() => {})
  }, [])

  const fetchVehicles = useCallback(() => {
    setLoading(true)
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
    vehicleAPI.getAll(params)
      .then(res => {
        setVehicles(res.data.data || [])
        setMeta(res.data.meta)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { fetchVehicles() }, [fetchVehicles])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...initialForm, categoryId: categories[0]?.id || '' })
    setFiles([])
    setModalOpen(true)
  }

  const openEdit = (v) => {
    setEditing(v)
    setForm({
      name: v.name || '', brand: v.brand || '', model: v.model || '', year: v.year || 2023,
      color: v.color || '', licensePlate: v.licensePlate || '', description: v.description || '',
      pricePerDay: v.pricePerDay || '', transmission: v.transmission || 'AUTOMATIC',
      fuelType: v.fuelType || 'BENSIN', capacity: v.capacity || 5, status: v.status || 'AVAILABLE',
      location: v.location || '', features: v.features || '', categoryId: v.categoryId || ''
    })
    setFiles([])
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) fd.append(k, v)
      })
      Array.from(files).forEach(f => fd.append('images', f))

      if (editing) {
        await vehicleAPI.update(editing.id, fd)
        toast.success('Kendaraan berhasil diperbarui')
      } else {
        await vehicleAPI.create(fd)
        toast.success('Kendaraan berhasil ditambahkan')
      }
      setModalOpen(false)
      fetchVehicles()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan kendaraan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await vehicleAPI.delete(deleteTarget.id)
      toast.success('Kendaraan berhasil dihapus')
      setDeleteTarget(null)
      fetchVehicles()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus kendaraan')
    }
  }

  return (
    <DashboardLayout title="Manajemen Kendaraan" subtitle="Kelola armada, harga sewa, dan ketersediaan unit">
      <div className="space-y-6">
        <div className="card p-4 flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={filters.search}
                onChange={e => setFilters(p => ({ ...p, search: e.target.value, page: 1 }))}
                placeholder="Cari nama kendaraan..."
                className="input-field pl-10 py-2.5"
              />
            </div>
            <select
              value={filters.status}
              onChange={e => setFilters(p => ({ ...p, status: e.target.value, page: 1 }))}
              className="input-field sm:w-44 py-2.5"
            >
              <option value="">Semua Status</option>
              <option value="AVAILABLE">Tersedia</option>
              <option value="RENTED">Disewa</option>
              <option value="MAINTENANCE">Perawatan</option>
              <option value="INACTIVE">Nonaktif</option>
            </select>
          </div>
          <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-4 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Tambah Kendaraan
          </button>
        </div>

        <div className="card">
          {loading ? (
            <LoadingSpinner text="Memuat kendaraan..." />
          ) : vehicles.length === 0 ? (
            <EmptyState icon={Car} title="Belum ada kendaraan" description="Tambahkan unit kendaraan pertama Anda." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Kendaraan</th>
                      <th className="px-4 py-3">Plat Nomor</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Spesifikasi</th>
                      <th className="px-4 py-3">Harga/Hari</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vehicles.map(v => (
                      <tr key={v.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={v.images?.[0]?.url || `https://placehold.co/80x50/e2e8f0/94a3b8?text=Car`}
                              alt={v.name}
                              className="w-14 h-10 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-gray-900">{v.name}</p>
                              <p className="text-xs text-gray-500">{v.brand} · {v.year}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{v.licensePlate}</td>
                        <td className="px-4 py-3">{v.category?.name}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {getTransmissionLabel(v.transmission)} · {getFuelLabel(v.fuelType)} · {v.capacity} kursi
                        </td>
                        <td className="px-4 py-3 font-semibold text-blue-600">{formatCurrency(v.pricePerDay)}</td>
                        <td className="px-4 py-3"><VehicleStatusBadge status={v.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-1">
                            <button onClick={() => openEdit(v)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => setDeleteTarget(v)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Hapus">
                              <Trash2 className="h-4 w-4" />
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Kendaraan' : 'Tambah Kendaraan Baru'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Kendaraan</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori</label>
              <select required value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} className="input-field py-2.5">
                <option value="">Pilih Kategori</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Merek (Brand)</label>
              <input required value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} className="input-field py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Model</label>
              <input required value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} className="input-field py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nomor Polisi</label>
              <input required value={form.licensePlate} onChange={e => setForm(p => ({ ...p, licensePlate: e.target.value }))} className="input-field py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Harga Sewa / Hari (IDR)</label>
              <input required type="number" min="1" value={form.pricePerDay} onChange={e => setForm(p => ({ ...p, pricePerDay: e.target.value }))} className="input-field py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tahun</label>
              <input required type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} className="input-field py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Warna</label>
              <input required value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="input-field py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Transmisi</label>
              <select value={form.transmission} onChange={e => setForm(p => ({ ...p, transmission: e.target.value }))} className="input-field py-2.5">
                <option value="AUTOMATIC">Otomatis</option>
                <option value="MANUAL">Manual</option>
                <option value="CVT">CVT</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Bahan Bakar</label>
              <select value={form.fuelType} onChange={e => setForm(p => ({ ...p, fuelType: e.target.value }))} className="input-field py-2.5">
                <option value="BENSIN">Bensin</option>
                <option value="DIESEL">Diesel</option>
                <option value="LISTRIK">Listrik</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Kapasitas Penumpang</label>
              <input required type="number" min="1" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} className="input-field py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="input-field py-2.5">
                <option value="AVAILABLE">Tersedia</option>
                <option value="RENTED">Disewa</option>
                <option value="MAINTENANCE">Perawatan</option>
                <option value="INACTIVE">Nonaktif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Lokasi Unit</label>
            <input required value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="input-field py-2.5" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Fitur (pisahkan dengan koma)</label>
            <input value={form.features} onChange={e => setForm(p => ({ ...p, features: e.target.value }))} placeholder="AC, GPS, Bluetooth" className="input-field py-2.5" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Deskripsi</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-field py-2.5" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Upload Gambar (Maks. 5 file)</label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={e => setFiles(e.target.files)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-sm py-2.5 px-5">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm py-2.5 px-5">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Kendaraan?"
        message={`Anda yakin ingin menghapus ${deleteTarget?.name}?`}
        confirmText="Ya, Hapus"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  )
}
