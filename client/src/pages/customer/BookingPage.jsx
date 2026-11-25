import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, CreditCard, CheckCircle2, Car } from 'lucide-react'
import { vehicleAPI, bookingAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency, calculateDays } from '../../utils/helpers'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { LoadingSpinner, ErrorState } from '../../components/common/UI'
import toast from 'react-hot-toast'

export default function BookingPage() {
  const { vehicleId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1)

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const [form, setForm] = useState({
    startDate: today,
    endDate: tomorrow,
    pickupLocation: '',
    paymentMethod: 'BANK_TRANSFER',
    notes: '',
  })

  useEffect(() => {
    setLoading(true)
    vehicleAPI.getById(vehicleId)
      .then(res => {
        const v = res.data.data
        setVehicle(v)
        setForm(prev => ({ ...prev, pickupLocation: v.location || '' }))
      })
      .catch(err => setError(err.response?.data?.message || 'Gagal memuat kendaraan'))
      .finally(() => setLoading(false))
  }, [vehicleId])

  const totalDays = form.startDate && form.endDate && new Date(form.endDate) > new Date(form.startDate)
    ? calculateDays(form.startDate, form.endDate)
    : 0
  const estimatedSubtotal = vehicle ? totalDays * parseFloat(vehicle.pricePerDay) : 0
  const additionalFee = 0
  const estimatedTotal = estimatedSubtotal + additionalFee

  const validateStep1 = () => {
    if (!form.startDate || !form.endDate) {
      toast.error('Tanggal mulai dan selesai harus diisi')
      return false
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      toast.error('Tanggal selesai harus setelah tanggal mulai')
      return false
    }
    if (new Date(form.startDate) < new Date(new Date().setHours(0, 0, 0, 0))) {
      toast.error('Tanggal mulai tidak boleh di masa lalu')
      return false
    }
    if (!form.pickupLocation || form.pickupLocation.trim().length < 3) {
      toast.error('Lokasi pengambilan minimal 3 karakter')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateStep1()) return
    setSubmitting(true)
    try {
      const res = await bookingAPI.create({
        vehicleId: parseInt(vehicleId),
        startDate: form.startDate,
        endDate: form.endDate,
        pickupLocation: form.pickupLocation,
        paymentMethod: form.paymentMethod,
        notes: form.notes || undefined,
      })
      toast.success('Pemesanan berhasil dibuat!')
      navigate(`/my-bookings/${res.data.data.id}`, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat pemesanan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={`/vehicles/${vehicleId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Detail Kendaraan
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Pemesanan Kendaraan</h1>

        {loading ? (
          <LoadingSpinner text="Memuat form pemesanan..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : vehicle && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stepper */}
              <div className="card p-4">
                <div className="flex items-center justify-between text-sm">
                  {[
                    { num: 1, label: 'Jadwal & Lokasi' },
                    { num: 2, label: 'Metode Pembayaran' },
                    { num: 3, label: 'Konfirmasi' },
                  ].map((s, idx) => (
                    <div key={s.num} className="flex items-center gap-2 flex-1">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                      </div>
                      <span className={`font-medium hidden sm:inline ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                        {s.label}
                      </span>
                      {idx < 2 && <div className="flex-1 h-px bg-gray-200 mx-2" />}
                    </div>
                  ))}
                </div>
              </div>

              {step === 1 && (
                <div className="card space-y-5">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" /> Detail Jadwal & Pengambilan
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Mulai</label>
                      <input
                        type="date"
                        value={form.startDate}
                        min={today}
                        onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Selesai</label>
                      <input
                        type="date"
                        value={form.endDate}
                        min={form.startDate || today}
                        onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Lokasi Pengambilan
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.pickupLocation}
                        onChange={e => setForm(p => ({ ...p, pickupLocation: e.target.value }))}
                        placeholder="Alamat atau titik pengambilan"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan Tambahan (Opsional)</label>
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Contoh: Butuh kursi bayi, ambil pukul 09.00 WIB..."
                      className="input-field"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => { if (validateStep1()) setStep(2) }}
                      className="btn-primary"
                    >
                      Lanjut ke Pembayaran
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="card space-y-5">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" /> Informasi Penyewa & Pembayaran
                  </h2>
                  <div className="p-4 bg-gray-50 rounded-xl space-y-1 text-sm">
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-gray-600">{user?.email} · {user?.phone}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Pilih Metode Pembayaran (Simulasi)</label>
                    <div className="space-y-3">
                      {[
                        { value: 'BANK_TRANSFER', title: 'Transfer Bank', desc: 'Upload bukti transfer setelah pemesanan dibuat' },
                        { value: 'E_WALLET', title: 'E-Wallet (Simulasi)', desc: 'OVO / GoPay / Dana / ShopeePay' },
                        { value: 'CASH', title: 'Tunai di Lokasi', desc: 'Bayar langsung saat pengambilan kendaraan' },
                      ].map(opt => (
                        <label
                          key={opt.value}
                          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                            form.paymentMethod === opt.value
                              ? 'border-blue-600 bg-blue-50/50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={opt.value}
                            checked={form.paymentMethod === opt.value}
                            onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}
                            className="mt-1"
                          />
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{opt.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button type="button" onClick={() => setStep(1)} className="btn-secondary">Kembali</button>
                    <button type="button" onClick={() => setStep(3)} className="btn-primary">Tinjau Pemesanan</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="card space-y-5">
                  <h2 className="text-lg font-bold text-gray-900">Konfirmasi Pemesanan</h2>
                  <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Kendaraan</span>
                      <span className="font-semibold text-gray-900">{vehicle.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tanggal Sewa</span>
                      <span className="font-semibold text-gray-900">{form.startDate} s/d {form.endDate} ({totalDays} hari)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Lokasi Pengambilan</span>
                      <span className="font-semibold text-gray-900">{form.pickupLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Metode Pembayaran</span>
                      <span className="font-semibold text-gray-900">
                        {form.paymentMethod === 'BANK_TRANSFER' ? 'Transfer Bank' : form.paymentMethod === 'E_WALLET' ? 'E-Wallet' : 'Tunai'}
                      </span>
                    </div>
                    {form.notes && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Catatan</span>
                        <span className="font-medium text-gray-800">{form.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800">
                    Catatan: Total harga final dihitung dan divalidasi secara otomatis oleh server saat pemesanan dikirim.
                  </div>

                  <div className="flex justify-between">
                    <button type="button" onClick={() => setStep(2)} className="btn-secondary">Kembali</button>
                    <button
                      type="button"
                      disabled={submitting || vehicle.status !== 'AVAILABLE'}
                      onClick={handleSubmit}
                      className="btn-primary"
                    >
                      {submitting ? 'Memproses...' : 'Kirim Pemesanan'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24 space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Car className="h-4 w-4 text-blue-600" /> Ringkasan Sewa
                </h3>
                <div className="flex gap-3 items-center pb-4 border-b border-gray-100">
                  <img
                    src={vehicle.images?.[0]?.url || `https://placehold.co/120x80/e2e8f0/94a3b8?text=${encodeURIComponent(vehicle.name)}`}
                    alt={vehicle.name}
                    className="w-20 h-14 object-cover rounded-lg bg-gray-100"
                  />
                  <div>
                    <p className="font-bold text-sm text-gray-900">{vehicle.name}</p>
                    <p className="text-xs text-gray-500">{vehicle.brand} · {vehicle.category?.name}</p>
                  </div>
                </div>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Harga per hari</span>
                    <span>{formatCurrency(vehicle.pricePerDay)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Durasi sewa</span>
                    <span>{totalDays} hari</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Biaya tambahan</span>
                    <span>{formatCurrency(additionalFee)}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Estimasi Total</span>
                    <span className="text-xl font-bold text-blue-600">{formatCurrency(estimatedTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
