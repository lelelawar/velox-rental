import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password harus diisi'),
})

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      const user = await login(data)
      toast.success(`Selamat datang, ${user.name.split(' ')[0]}!`)
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login gagal')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl text-gray-900 mb-6">
            <div className="bg-blue-600 p-1.5 rounded-lg"><Car className="h-5 w-5 text-white" /></div>
            VELOX RENTAL
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Selamat Datang Kembali</h1>
          <p className="text-gray-500 mt-1 text-sm">Masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input {...register('email')} type="email" placeholder="nama@email.com" className="input-field" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Masukkan password" className="input-field pr-10" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
          Belum punya akun?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">Daftar sekarang</Link>
        </div>
      </div>
    </div>
  )
}
