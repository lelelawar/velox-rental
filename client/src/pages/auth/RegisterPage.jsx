import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Konfirmasi password tidak cocok', path: ['confirmPassword'] })

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      await registerUser(data)
      toast.success('Registrasi berhasil! Selamat datang.')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registrasi gagal')
    }
  }

  const fields = [
    { name: 'name', label: 'Nama Lengkap', type: 'text', placeholder: 'Nama lengkap Anda' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'nama@email.com' },
    { name: 'phone', label: 'Nomor Telepon', type: 'tel', placeholder: '08xxxxxxxxxx' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl text-gray-900 mb-6">
            <div className="bg-blue-600 p-1.5 rounded-lg"><Car className="h-5 w-5 text-white" /></div>
            VELOX RENTAL
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
          <p className="text-gray-500 mt-1 text-sm">Daftar dan mulai sewa kendaraan impian Anda</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
              <input {...register(name)} type={type} placeholder={placeholder} className="input-field" />
              {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
            </div>
          ))}
          {['password', 'confirmPassword'].map((name) => (
            <div key={name}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {name === 'password' ? 'Password' : 'Konfirmasi Password'}
              </label>
              <div className="relative">
                <input {...register(name)} type={showPass ? 'text' : 'password'}
                  placeholder={name === 'password' ? 'Minimal 6 karakter' : 'Ulangi password'}
                  className="input-field pr-10" />
                {name === 'password' && (
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
              {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
            </div>
          ))}
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
            {isSubmitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">Masuk sekarang</Link>
        </div>
      </div>
    </div>
  )
}
