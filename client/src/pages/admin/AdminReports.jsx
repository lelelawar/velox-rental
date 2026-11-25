import { useState, useEffect, useCallback } from 'react'
import { Download, BarChart3, Wallet, BookOpen } from 'lucide-react'
import { adminAPI } from '../../services/api'
import { formatCurrency, exportToCSV, getBookingStatusLabel } from '../../utils/helpers'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner } from '../../components/common/UI'

export default function AdminReports() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [preset, setPreset] = useState('month')
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })

  const applyPreset = (type) => {
    setPreset(type)
    const now = new Date()
    const end = now.toISOString().split('T')[0]
    let start = ''
    if (type === 'today') {
      start = end
    } else if (type === 'week') {
      const d = new Date(now)
      d.setDate(d.getDate() - 7)
      start = d.toISOString().split('T')[0]
    } else if (type === 'month') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1)
      start = d.toISOString().split('T')[0]
    } else {
      return
    }
    setDateRange({ startDate: start, endDate: end })
  }

  const fetchReports = useCallback(() => {
    setLoading(true)
    const params = {}
    if (dateRange.startDate && dateRange.endDate) {
      params.startDate = dateRange.startDate
      params.endDate = dateRange.endDate
    }
    adminAPI.reports(params)
      .then(res => setReport(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [dateRange])

  useEffect(() => {
    applyPreset('month')
  }, [])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleExportCSV = () => {
    if (!report) return
    const rows = (report.vehicleStats || []).map(v => ({
      Kendaraan: v.name,
      Merek: v.brand,
      Total_Sewa: v._count?.bookings || 0,
    }))
    exportToCSV(rows, `laporan-velox-rental-${new Date().toISOString().split('T')[0]}`)
  }

  return (
    <DashboardLayout title="Laporan & Analitik" subtitle="Pantau pendapatan, utilisasi kendaraan, dan ekspor data">
      <div className="space-y-6">
        {/* Filter Controls */}
        <div className="card p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              ['today', 'Hari Ini'],
              ['week', 'Minggu Ini'],
              ['month', 'Bulan Ini'],
              ['custom', 'Rentang Kustom'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  preset === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={e => { setPreset('custom'); setDateRange(p => ({ ...p, startDate: e.target.value })) }}
              className="input-field w-auto py-2 text-xs"
            />
            <span className="text-gray-400 text-xs">s/d</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={e => { setPreset('custom'); setDateRange(p => ({ ...p, endDate: e.target.value })) }}
              className="input-field w-auto py-2 text-xs"
            />
            <button onClick={handleExportCSV} className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
              <Download className="h-4 w-4" /> Ekspor CSV
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Memuat laporan..." />
        ) : report && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card flex items-center gap-4">
                <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Pendapatan (Lunas)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(report.paymentStats?._sum?.amount || 0)}
                  </p>
                </div>
              </div>
              <div className="card flex items-center gap-4">
                <div className="p-3.5 rounded-xl bg-green-50 text-green-600">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Transaksi Lunas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {report.paymentStats?._count?.id || 0} transaksi
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Booking Status Breakdown */}
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" /> Statistik Status Pemesanan
                </h3>
                <div className="space-y-3">
                  {(report.bookingStats || []).map(item => (
                    <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                      <span className="font-medium text-gray-700">{getBookingStatusLabel(item.status)}</span>
                      <span className="font-bold text-gray-900">{item._count?.id || 0} pemesanan</span>
                    </div>
                  ))}
                  {(!report.bookingStats || report.bookingStats.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-6">Tidak ada data pada periode ini</p>
                  )}
                </div>
              </div>

              {/* Most Rented Vehicles */}
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-4">Kendaraan Paling Sering Disewa</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-2.5">Kendaraan</th>
                        <th className="px-4 py-2.5">Merek</th>
                        <th className="px-4 py-2.5 text-right">Total Sewa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(report.vehicleStats || []).map(v => (
                        <tr key={v.id}>
                          <td className="px-4 py-2.5 font-semibold text-gray-900">{v.name}</td>
                          <td className="px-4 py-2.5 text-gray-500">{v.brand}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-blue-600">{v._count?.bookings || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
