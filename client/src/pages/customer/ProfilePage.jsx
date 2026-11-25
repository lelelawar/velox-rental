import { useState, useEffect } from 'react'
import { User, Lock } from 'lucide-react'
import { profileAPI } from '../../services/api'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner } from '../../components/common/UI'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPass, setSavingPass] = useState(false)

  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  useEffect(() => {
    profileAPI.get()
      .then(res => {
        const u = res.data.data
        setProfile({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          address: u.address || ''
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await profileAPI.update({
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      })
      localStorage.setItem('velox_user', JSON.stringify(res.data.data))
      toast.success('Profil berhasil diperbarui')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Konfirmasi password baru tidak cocok')
    }
    setSavingPass(true)
    try {
      await profileAPI.changePassword(passwords)
      toast.success('Password berhasil diubah')
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password')
    } finally {
      setSavingPass(false)
    }
  }

  return (
    <DashboardLayout title="Profil Saya" subtitle="Kelola informasi akun dan keamanan password Anda">
      {loading ? (
        <LoadingSpinner text="Memuat profil..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Info */}
          <form onSubmit={handleProfileSubmit} className="card space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
              <User className="h-5 w-5 text-blue-600" /> Informasi Pribadi
            </h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="input-field bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nomor Telepon</label>
              <input
                type="tel"
                required
                value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat</label>
              <textarea
                rows={3}
                value={profile.address}
                onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                placeholder="Alamat lengkap Anda"
                className="input-field"
              />
            </div>
            <button type="submit" disabled={savingProfile} className="btn-primary text-sm">
              {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>

          {/* Change Password */}
          <form onSubmit={handlePasswordSubmit} className="card space-y-4 h-fit">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
              <Lock className="h-5 w-5 text-blue-600" /> Ubah Password
            </h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password Saat Ini</label>
              <input
                type="password"
                required
                value={passwords.currentPassword}
                onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password Baru</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwords.newPassword}
                onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Konfirmasi Password Baru</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwords.confirmPassword}
                onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                className="input-field"
              />
            </div>
            <button type="submit" disabled={savingPass} className="btn-primary text-sm">
              {savingPass ? 'Mengubah...' : 'Ubah Password'}
            </button>
          </form>
        </div>
      )}
    </DashboardLayout>
  )
}
