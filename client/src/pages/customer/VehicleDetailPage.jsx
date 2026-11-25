import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Users, Fuel, Settings2, Calendar,
  ShieldCheck, CheckCircle2, Star, Car
} from 'lucide-react'
import { vehicleAPI } from '../../services/api'
import {
  formatCurrency, formatDate, getTransmissionLabel, getFuelLabel
} from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { LoadingSpinner, ErrorState } from '../../components/common/UI'
import { VehicleStatusBadge } from '../../components/common/StatusBadge'

export default function VehicleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)

  const fetchVehicle = () => {
    setLoading(true)
    setError(null)
    vehicleAPI.getById(id)
      .then(res => {
        setVehicle(res.data.data)
        setSelectedImage(0)
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Gagal memuat detail kendaraan')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchVehicle()
  }, [id])

  const fallbackImg = (name) =>
    `https://placehold.co/800x500/e2e8f0/64748b?text=${encodeURIComponent(name || 'VELOX RENTAL')}`

  const images = vehicle?.images?.length > 0
    ? vehicle.images
    : [{ id: 0, url: fallbackImg(vehicle?.name) }]

  const featuresList = vehicle?.features
    ? vehicle.features.split(',').map(f => f.trim()).filter(Boolean)
    : []

  const handleBookClick = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/booking/${vehicle.id}` } } })
      return
    }
    navigate(`/booking/${vehicle.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog
        </Link>

        {loading ? (
          <LoadingSpinner text="Memuat detail kendaraan..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchVehicle} />
        ) : vehicle && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Images & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="card p-4">
                <div className="relative h-72 sm:h-96 bg-gray-100 rounded-xl overflow-hidden mb-3">
                  <img
                    src={images[selectedImage]?.url || fallbackImg(vehicle.name)}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = fallbackImg(vehicle.name) }}
                  />
                  <div className="absolute top-4 left-4">
                    <VehicleStatusBadge status={vehicle.status} />
                  </div>
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {images.map((img, idx) => (
                      <button
                        key={img.id || idx}
                        type="button"
                        onClick={() => setSelectedImage(idx)}
                        className={`h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === idx ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`${vehicle.name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.src = fallbackImg(vehicle.name) }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Specifications & Description */}
              <div className="card space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="badge-info">{vehicle.category?.name}</span>
                    <span className="badge-gray">{vehicle.licensePlate}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{vehicle.name}</h1>
                  <p className="text-gray-500 mt-1">{vehicle.brand} {vehicle.model} · Tahun {vehicle.year} · Warna {vehicle.color}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <Settings2 className="h-4 w-4 text-blue-600" /> Transmisi
                    </div>
                    <p className="font-semibold text-sm text-gray-900">{getTransmissionLabel(vehicle.transmission)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <Fuel className="h-4 w-4 text-blue-600" /> Bahan Bakar
                    </div>
                    <p className="font-semibold text-sm text-gray-900">{getFuelLabel(vehicle.fuelType)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <Users className="h-4 w-4 text-blue-600" /> Kapasitas
                    </div>
                    <p className="font-semibold text-sm text-gray-900">{vehicle.capacity} Penumpang</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <Calendar className="h-4 w-4 text-blue-600" /> Tahun
                    </div>
                    <p className="font-semibold text-sm text-gray-900">{vehicle.year}</p>
                  </div>
                </div>

                {vehicle.description && (
                  <div className="pt-4 border-t border-gray-100">
                    <h2 className="font-bold text-gray-900 mb-2">Deskripsi Kendaraan</h2>
                    <p className="text-gray-600 text-sm leading-relaxed">{vehicle.description}</p>
                  </div>
                )}

                {featuresList.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <h2 className="font-bold text-gray-900 mb-3">Fitur & Fasilitas</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {featuresList.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rental Terms */}
                <div className="pt-4 border-t border-gray-100">
                  <h2 className="font-bold text-gray-900 mb-3">Syarat & Ketentuan Sewa</h2>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Wajib memiliki SIM A yang masih berlaku dan KTP asli saat pengambilan kendaraan.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Durasi sewa dihitung per hari (24 jam). Keterlambatan pengembalian dapat dikenakan biaya tambahan.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Kendaraan harus dikembalikan dengan kondisi bersih dan bahan bakar sesuai saat pengambilan.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Reviews */}
              <div className="card">
                <h2 className="font-bold text-gray-900 mb-4">
                  Ulasan Pelanggan ({vehicle.reviews?.length || 0})
                </h2>
                {vehicle.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {vehicle.reviews.map(rev => (
                      <div key={rev.id} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm text-gray-900">{rev.user?.name}</span>
                          <span className="text-xs text-gray-400">{formatDate(rev.createdAt)}</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                        {rev.comment && <p className="text-sm text-gray-600">{rev.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Belum ada ulasan untuk kendaraan ini.</p>
                )}
              </div>
            </div>

            {/* Right: Booking Card */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24 space-y-5">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Harga Sewa</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold text-blue-600">{formatCurrency(vehicle.pricePerDay)}</span>
                    <span className="text-sm text-gray-500">/ hari</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-gray-400" /> Lokasi Ambil
                    </span>
                    <span className="font-semibold text-gray-900">{vehicle.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Car className="h-4 w-4 text-gray-400" /> Status Unit
                    </span>
                    <VehicleStatusBadge status={vehicle.status} />
                  </div>
                </div>

                {isAdmin ? (
                  <Link to="/admin/vehicles" className="btn-secondary w-full block text-center">
                    Kelola di Admin Panel
                  </Link>
                ) : (
                  <button
                    onClick={handleBookClick}
                    disabled={vehicle.status !== 'AVAILABLE'}
                    className="btn-primary w-full"
                  >
                    {vehicle.status === 'AVAILABLE' ? 'Pesan Sekarang' : 'Kendaraan Tidak Tersedia'}
                  </button>
                )}

                <p className="text-xs text-center text-gray-400">
                  Pembayaran aman & transparan dalam mata uang IDR
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
