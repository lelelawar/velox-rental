import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Filter, ChevronRight, Users, SlidersHorizontal, X } from 'lucide-react'
import { vehicleAPI, categoryAPI } from '../../services/api'
import { formatCurrency, getTransmissionLabel, getFuelLabel } from '../../utils/helpers'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { LoadingSpinner, EmptyState, Pagination } from '../../components/common/UI'
import { VehicleStatusBadge } from '../../components/common/StatusBadge'

export default function VehiclesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [vehicles, setVehicles] = useState([])
  const [categories, setCategories] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
    status: searchParams.get('status') || 'AVAILABLE',
    transmission: searchParams.get('transmission') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: 'pricePerDay',
    sortOrder: 'asc',
    page: 1,
  })

  useEffect(() => { categoryAPI.getAll().then(r => setCategories(r.data.data || [])) }, [])

  const fetchVehicles = useCallback(() => {
    setLoading(true)
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
    vehicleAPI.getAll(params).then(r => {
      setVehicles(r.data.data || [])
      setMeta(r.data.meta)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { fetchVehicles() }, [fetchVehicles])

  const updateFilter = (key, value) => setFilters(p => ({ ...p, [key]: value, page: 1 }))

  const clearFilters = () => setFilters({
    search: '', categoryId: '', status: '', transmission: '', minPrice: '', maxPrice: '',
    sortBy: 'pricePerDay', sortOrder: 'asc', page: 1
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Katalog Kendaraan</h1>
            <p className="text-gray-500 mt-1">{meta?.total || 0} kendaraan tersedia</p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 btn-secondary text-sm py-2 px-4">
            <SlidersHorizontal className="h-4 w-4" /> Filter
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-64 flex-shrink-0`}>
            <div className="card sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><Filter className="h-4 w-4" /> Filter</h3>
                <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">Reset</button>
              </div>
              <div className="space-y-5">
                {/* Search */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Cari</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input value={filters.search} onChange={e => updateFilter('search', e.target.value)}
                      placeholder="Nama kendaraan..." className="input-field pl-9 text-sm py-2.5" />
                  </div>
                </div>
                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Kategori</label>
                  <select value={filters.categoryId} onChange={e => updateFilter('categoryId', e.target.value)} className="input-field text-sm py-2.5">
                    <option value="">Semua Kategori</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                {/* Status */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Status</label>
                  <select value={filters.status} onChange={e => updateFilter('status', e.target.value)} className="input-field text-sm py-2.5">
                    <option value="">Semua Status</option>
                    <option value="AVAILABLE">Tersedia</option>
                    <option value="RENTED">Disewa</option>
                  </select>
                </div>
                {/* Transmission */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Transmisi</label>
                  <select value={filters.transmission} onChange={e => updateFilter('transmission', e.target.value)} className="input-field text-sm py-2.5">
                    <option value="">Semua</option>
                    <option value="MANUAL">Manual</option>
                    <option value="AUTOMATIC">Otomatis</option>
                    <option value="CVT">CVT</option>
                  </select>
                </div>
                {/* Price range */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Harga/Hari</label>
                  <div className="flex gap-2">
                    <input value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)}
                      type="number" placeholder="Min" className="input-field text-sm py-2.5 w-1/2" />
                    <input value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)}
                      type="number" placeholder="Max" className="input-field text-sm py-2.5 w-1/2" />
                  </div>
                </div>
                {/* Sort */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Urutkan</label>
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={e => { const [by, order] = e.target.value.split('-'); setFilters(p => ({ ...p, sortBy: by, sortOrder: order, page: 1 })) }}
                    className="input-field text-sm py-2.5">
                    <option value="pricePerDay-asc">Harga: Termurah</option>
                    <option value="pricePerDay-desc">Harga: Termahal</option>
                    <option value="createdAt-desc">Terbaru</option>
                    <option value="name-asc">Nama A-Z</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Grid */}
          <div className="flex-1">
            {loading ? (
              <LoadingSpinner text="Memuat kendaraan..." />
            ) : vehicles.length === 0 ? (
              <EmptyState icon={Search} title="Kendaraan tidak ditemukan" description="Coba ubah filter pencarian Anda" />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {vehicles.map(v => (
                    <Link key={v.id} to={`/vehicles/${v.id}`} className="card p-0 overflow-hidden hover:shadow-md transition-all group flex flex-col">
                      <div className="relative h-44 bg-gray-100 overflow-hidden">
                        <img
                          src={v.images?.[0]?.url || `https://placehold.co/400x250/e2e8f0/94a3b8?text=${encodeURIComponent(v.name)}`}
                          alt={v.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={e => { e.target.src = `https://placehold.co/400x250/e2e8f0/94a3b8?text=${encodeURIComponent(v.name)}` }}
                        />
                        <div className="absolute top-2 left-2"><VehicleStatusBadge status={v.status} /></div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="text-xs text-blue-600 font-medium mb-1">{v.category?.name}</div>
                        <h3 className="font-bold text-sm text-gray-900 mb-1">{v.name}</h3>
                        <p className="text-xs text-gray-500 mb-3">{v.brand} · {v.year} · {v.location}</p>
                        <div className="flex gap-3 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{v.capacity}</span>
                          <span>{getTransmissionLabel(v.transmission)}</span>
                          <span>{getFuelLabel(v.fuelType)}</span>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div>
                            <span className="font-bold text-blue-600">{formatCurrency(v.pricePerDay)}</span>
                            <span className="text-xs text-gray-400">/hari</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Pagination meta={meta} onPageChange={p => setFilters(prev => ({ ...prev, page: p }))} />
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
