import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Upload, CreditCard, MapPin, Calendar, FileText } from 'lucide-react'
import { bookingAPI, paymentAPI } from '../../services/api'
import { formatCurrency, formatDate, getPaymentMethodLabel } from '../../utils/helpers'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { LoadingSpinner, ErrorState, ConfirmDialog } from '../../components/common/UI'
import { BookingStatusBadge, PaymentStatusBadge } from '../../components/common/StatusBadge'
import toast from 'react-hot-toast'

export default function BookingDetailPage() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [proofFile, setProofFile] = useState(null)
  const [proofNotes, setProofNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const fetchDetail = useCallback(() => {
    setLoading(true)
    setError(null)
    bookingAPI.getById(id)
      .then(res => setBooking(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Gagal memuat detail pemesanan'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { fetchDetail() }, [fetchDetail])

  const handleUploadProof = async (e) => {
    e.preventDefault()
    if (!proofFile) return toast.error('Pilih file bukti pembayaran terlebih dahulu')
    const formData = new FormData()
    formData.append('proof', proofFile)
    if (proofNotes) formData.append('notes', proofNotes)
    setUploading(true)
    try {
      await paymentAPI.uploadProof(booking.payment.id, formData)
      toast.success('Bukti pembayaran berhasil diunggah')
      setProofFile(null)
      setProofNotes('')
      fetchDetail()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengunggah bukti pembayaran')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = async () => {
    try {
      await bookingAPI.cancel(booking.id)
      toast.success('Pemesanan berhasil dibatalkan')
      setConfirmCancel(false)
      fetchDetail()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membatalkan pemesanan')
    }
  }

  return (
    <DashboardLayout title="Detail Pemesanan" subtitle={booking?.bookingCode || ''}>
      <Link to="/my-bookings" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Pemesanan Saya
      </Link>

      {loading ? (
        <LoadingSpinner text="Memuat detail pemesanan..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDetail} />
      ) : booking && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Info */}
            <div className="card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Kode Pemesanan</p>
                  <h2 className="text-xl font-bold text-gray-900">{booking.bookingCode}</h2>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={booking.vehicle?.images?.[0]?.url || `https://placehold.co/150x100/e2e8f0/94a3b8?text=${encodeURIComponent(booking.vehicle?.name || '')}`}
                  alt={booking.vehicle?.name}
                  className="w-28 h-20 object-cover rounded-xl bg-gray-100"
                />
                <div>
                  <p className="text-xs text-blue-600 font-medium">{booking.vehicle?.category?.name}</p>
                  <h3 className="font-bold text-gray-900">{booking.vehicle?.name}</h3>
                  <p className="text-xs text-gray-500">{booking.vehicle?.brand} · {booking.vehicle?.licensePlate}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-sm">
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs">Periode Sewa</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(booking.startDate)} – {formatDate(booking.endDate)} ({booking.totalDays} hari)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs">Lokasi Pengambilan</p>
                    <p className="font-semibold text-gray-900">{booking.pickupLocation}</p>
                  </div>
                </div>
              </div>

              {booking.notes && (
                <div className="p-3 bg-gray-50 rounded-xl text-sm flex items-start gap-2">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-700">Catatan: </span>
                    <span className="text-gray-600">{booking.notes}</span>
                  </div>
                </div>
              )}

              {booking.rejectionReason && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                  <span className="font-semibold">Alasan Penolakan: </span>{booking.rejectionReason}
                </div>
              )}
            </div>

            {/* Payment & Upload Proof */}
            {booking.payment && (
              <div className="card space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" /> Informasi Pembayaran (Simulasi)
                  </h3>
                  <PaymentStatusBadge status={booking.payment.status} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Metode Pembayaran</p>
                    <p className="font-semibold text-gray-900">{getPaymentMethodLabel(booking.payment.method)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Tagihan</p>
                    <p className="font-bold text-blue-600">{formatCurrency(booking.payment.amount)}</p>
                  </div>
                </div>

                {booking.payment.method === 'BANK_TRANSFER' && booking.payment.status === 'PENDING' && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm space-y-1">
                    <p className="font-bold text-blue-900">Instruksi Simulasi Transfer Bank</p>
                    <p className="text-blue-800">Bank BCA: 1234567890 a.n. PT VELOX RENTAL INDONESIA (Simulasi)</p>
                    <p className="text-xs text-blue-700">Silakan unggah bukti transfer di bawah ini untuk diverifikasi oleh admin.</p>
                  </div>
                )}

                {booking.payment.status === 'PENDING' && booking.status !== 'CANCELLED' && booking.status !== 'REJECTED' && (
                  <form onSubmit={handleUploadProof} className="space-y-3 pt-2 border-t border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700">Unggah Bukti Pembayaran</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={e => setProofFile(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <input
                      type="text"
                      value={proofNotes}
                      onChange={e => setProofNotes(e.target.value)}
                      placeholder="Catatan transfer (opsional)"
                      className="input-field text-sm py-2.5"
                    />
                    <button type="submit" disabled={uploading} className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      {uploading ? 'Mengunggah...' : 'Unggah Bukti'}
                    </button>
                  </form>
                )}

                {booking.payment.proofs?.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Bukti Terunggah</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {booking.payment.proofs.map(p => (
                        <a key={p.id} href={p.fileUrl} target="_blank" rel="noreferrer" className="block border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                          <img src={p.fileUrl} alt="Bukti pembayaran" className="w-full h-28 object-cover" />
                          {p.notes && <p className="p-2 text-xs text-gray-600 truncate">{p.notes}</p>}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card space-y-4 sticky top-24">
              <h3 className="font-bold text-gray-900">Rincian Biaya</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tarif harian</span>
                  <span>{formatCurrency(booking.pricePerDay)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Durasi</span>
                  <span>{booking.totalDays} hari</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(booking.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Biaya tambahan</span>
                  <span>{formatCurrency(booking.additionalFee)}</span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(booking.totalPrice)}</span>
                </div>
              </div>

              {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="btn-danger w-full text-sm py-2.5"
                >
                  Batalkan Pemesanan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmCancel}
        title="Batalkan Pemesanan?"
        message="Apakah Anda yakin ingin membatalkan pemesanan ini?"
        confirmText="Ya, Batalkan"
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
      />
    </DashboardLayout>
  )
}
