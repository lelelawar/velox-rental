import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, Calendar, ChevronRight, Star, Shield, Clock, Headphones, Car, Truck, Users } from 'lucide-react'
import { vehicleAPI, categoryAPI } from '../../services/api'
import { formatCurrency } from '../../utils/helpers'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

const VehicleCard = ({ vehicle }) => {
  const primaryImage = vehicle.images?.[0]?.url
  return (
    <Link to={`/vehicles/${vehicle.id}`} className="card hover:shadow-md transition-all duration-200 group overflow-hidden p-0 flex flex-col">
      <div className="relative overflow-hidden h-48 bg-gray-100">
        <img
          src={primaryImage || `https://placehold.co/400x250/e2e8f0/94a3b8?text=${encodeURIComponent(vehicle.name)}`}
          alt={vehicle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = `https://placehold.co/400x250/e2e8f0/94a3b8?text=${encodeURIComponent(vehicle.name)}` }}
        />
        <div className="absolute top-3 left-3">
          <span className={vehicle.status === 'AVAILABLE' ? 'badge-success' : 'badge-danger'}>
            {vehicle.status === 'AVAILABLE' ? 'Tersedia' : 'Tidak Tersedia'}
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="text-xs text-blue-600 font-medium mb-1">{vehicle.category?.name}</div>
        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{vehicle.name}</h3>
        <p className="text-sm text-gray-500 mb-3">{vehicle.brand} · {vehicle.year}</p>
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{vehicle.capacity} kursi</span>
          <span>{vehicle.transmission === 'AUTOMATIC' ? 'Otomatis' : vehicle.transmission === 'CVT' ? 'CVT' : 'Manual'}</span>
          <span>{vehicle.fuelType}</span>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-blue-600">{formatCurrency(vehicle.pricePerDay)}</span>
            <span className="text-xs text-gray-400">/hari</span>
          </div>
          <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const [featuredVehicles, setFeaturedVehicles] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchForm, setSearchForm] = useState({ type: '', pickup: '', startDate: '', endDate: '' })
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      vehicleAPI.getAll({ limit: 6, status: 'AVAILABLE' }),
      categoryAPI.getAll()
    ]).then(([vRes, cRes]) => {
      setFeaturedVehicles(vRes.data.data || [])
      setCategories(cRes.data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchForm.type) params.set('categoryId', searchForm.type)
    if (searchForm.startDate) params.set('startDate', searchForm.startDate)
    if (searchForm.endDate) params.set('endDate', searchForm.endDate)
    navigate(`/vehicles?${params.toString()}`)
  }

  const testimonials = [
    { name: 'Budi Santoso', rating: 5, comment: 'Pelayanan luar biasa! Mobil bersih dan terawat. Pasti akan sewa lagi.' },
    { name: 'Siti Rahayu', rating: 5, comment: 'Proses pemesanan mudah dan cepat. Driver tepat waktu.' },
    { name: 'Ahmad Fauzi', rating: 4, comment: 'Harga terjangkau dengan kualitas kendaraan premium. Recommended!' },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gray-900 text-white min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80" alt="hero" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></span>
              Platform Sewa Kendaraan #1 di Indonesia
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Sewa Kendaraan<br />
              <span className="text-blue-400">Premium</span> dengan<br />
              Mudah & Aman
            </h1>
            <p className="text-gray-300 text-lg mb-10 leading-relaxed">
              Nikmati pengalaman berkendara terbaik dengan armada kendaraan premium kami. 
              Tersedia berbagai pilihan kendaraan untuk setiap kebutuhan perjalanan Anda.
            </p>
            <div className="flex gap-4">
              <Link to="/vehicles" className="btn-primary text-base px-8 py-4">Lihat Kendaraan</Link>
              <Link to="/register" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-all">Daftar Gratis</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="max-w-5xl mx-auto px-4 -mt-10 relative z-10">
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Jenis Kendaraan</label>
              <select
                value={searchForm.type}
                onChange={e => setSearchForm(p => ({ ...p, type: e.target.value }))}
                className="input-field"
              >
                <option value="">Semua Jenis</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Tanggal Mulai</label>
              <input type="date" value={searchForm.startDate} min={new Date().toISOString().split('T')[0]}
                onChange={e => setSearchForm(p => ({ ...p, startDate: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Tanggal Selesai</label>
              <input type="date" value={searchForm.endDate} min={searchForm.startDate || new Date().toISOString().split('T')[0]}
                onChange={e => setSearchForm(p => ({ ...p, endDate: e.target.value }))} className="input-field" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                <Search className="h-4 w-4" /> Cari Kendaraan
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Featured Vehicles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Kendaraan Unggulan</h2>
            <p className="text-gray-500">Pilihan kendaraan terbaik untuk perjalanan Anda</p>
          </div>
          <Link to="/vehicles" className="btn-secondary text-sm py-2 px-4 hidden md:flex items-center gap-1">
            Lihat Semua <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-72 bg-gray-200 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        )}
        <div className="text-center mt-8 md:hidden">
          <Link to="/vehicles" className="btn-primary">Lihat Semua Kendaraan</Link>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Kategori Populer</h2>
            <p className="text-gray-500">Temukan kendaraan sesuai kebutuhan perjalanan Anda</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.slice(0, 5).map(cat => (
              <Link key={cat.id} to={`/vehicles?categoryId=${cat.id}`}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
                <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                  <Car className="h-7 w-7 text-blue-600" />
                </div>
                <span className="font-semibold text-gray-700 text-sm text-center">{cat.name}</span>
                <span className="text-xs text-gray-400">{cat._count?.vehicles || 0} kendaraan</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Mengapa Memilih VELOX?</h2>
            <p className="text-gray-500">Kami berkomitmen memberikan pengalaman sewa terbaik</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Terpercaya & Aman', desc: 'Semua kendaraan terasuransi dan terverifikasi' },
              { icon: Clock, title: 'Proses Cepat', desc: 'Pemesanan online mudah dalam hitungan menit' },
              { icon: Car, title: 'Armada Premium', desc: 'Kendaraan terawat dan selalu dalam kondisi prima' },
              { icon: Headphones, title: 'Dukungan 24/7', desc: 'Tim kami siap membantu kapan pun Anda butuhkan' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card text-center hover:shadow-md transition-shadow">
                <div className="p-4 bg-blue-50 rounded-2xl w-fit mx-auto mb-4">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Cara Kerja</h2>
            <p className="text-gray-500">Proses pemesanan mudah dalam 4 langkah</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Pilih Kendaraan', desc: 'Jelajahi katalog dan pilih kendaraan yang sesuai kebutuhan' },
              { step: '02', title: 'Isi Detail Pemesanan', desc: 'Tentukan tanggal, lokasi, dan detail perjalanan Anda' },
              { step: '03', title: 'Konfirmasi & Bayar', desc: 'Review pemesanan dan lakukan pembayaran' },
              { step: '04', title: 'Ambil Kendaraan', desc: 'Kendaraan siap di lokasi pengambilan yang ditentukan' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="text-5xl font-black text-blue-100 mb-4">{step}</div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Apa Kata Pelanggan Kami</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, rating, comment }) => (
              <div key={name} className="card">
                <div className="flex gap-1 mb-3">
                  {[...Array(rating)].map((_, i) => <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-gray-600 mb-4 text-sm italic">"{comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                    {name[0]}
                  </div>
                  <span className="font-semibold text-sm text-gray-900">{name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Memulai Perjalanan?</h2>
          <p className="text-blue-100 mb-8 text-lg">Daftar sekarang dan dapatkan akses ke ratusan kendaraan premium</p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-4 rounded-xl transition-colors">Daftar Sekarang</Link>
            <Link to="/vehicles" className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-8 py-4 rounded-xl transition-colors">Lihat Kendaraan</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
