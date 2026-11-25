import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { categoryAPI } from '../../services/api'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, EmptyState, Modal, ConfirmDialog } from '../../components/common/UI'
import toast from 'react-hot-toast'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', icon: 'Car' })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchCategories = () => {
    setLoading(true)
    categoryAPI.getAll()
      .then(res => setCategories(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCategories() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', icon: 'Car' })
    setModalOpen(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || 'Car' })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await categoryAPI.update(editing.id, form)
        toast.success('Kategori berhasil diperbarui')
      } else {
        await categoryAPI.create(form)
        toast.success('Kategori berhasil ditambahkan')
      }
      setModalOpen(false)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan kategori')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await categoryAPI.delete(deleteTarget.id)
      toast.success('Kategori berhasil dihapus')
      setDeleteTarget(null)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus kategori')
    }
  }

  return (
    <DashboardLayout title="Manajemen Kategori" subtitle="Kelola kategori kendaraan yang tersedia">
      <div className="space-y-6">
        <div className="flex justify-end">
          <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-4 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Tambah Kategori
          </button>
        </div>

        <div className="card">
          {loading ? (
            <LoadingSpinner text="Memuat kategori..." />
          ) : categories.length === 0 ? (
            <EmptyState icon={Tag} title="Belum ada kategori" description="Tambahkan kategori kendaraan pertama." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">Nama Kategori</th>
                    <th className="px-4 py-3">Deskripsi</th>
                    <th className="px-4 py-3">Jumlah Unit</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-semibold text-gray-900">{cat.name}</td>
                      <td className="px-4 py-3 text-gray-500">{cat.description || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="badge-info">{cat._count?.vehicles || 0} unit</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <button onClick={() => openEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(cat)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Kategori' : 'Tambah Kategori'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Kategori</label>
            <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-field" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-sm py-2 px-4">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm py-2 px-4">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Kategori?"
        message={`Anda yakin ingin menghapus kategori "${deleteTarget?.name}"?`}
        confirmText="Ya, Hapus"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  )
}
