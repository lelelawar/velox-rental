export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatDate = (date, options = {}) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    ...options
  }).format(new Date(date))
}

export const formatDateShort = (date) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(date))
}

export const formatDateInput = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

export const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 1
}

export const getBookingStatusLabel = (status) => {
  const labels = {
    PENDING: 'Menunggu',
    CONFIRMED: 'Dikonfirmasi',
    REJECTED: 'Ditolak',
    ACTIVE: 'Aktif',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
  }
  return labels[status] || status
}

export const getBookingStatusClass = (status) => {
  const classes = {
    PENDING: 'badge-warning',
    CONFIRMED: 'badge-info',
    REJECTED: 'badge-danger',
    ACTIVE: 'badge-success',
    COMPLETED: 'badge-gray',
    CANCELLED: 'badge-danger',
  }
  return classes[status] || 'badge-gray'
}

export const getPaymentStatusLabel = (status) => {
  const labels = {
    PENDING: 'Menunggu',
    PAID: 'Lunas',
    FAILED: 'Gagal',
    REFUNDED: 'Dikembalikan',
  }
  return labels[status] || status
}

export const getPaymentStatusClass = (status) => {
  const classes = {
    PENDING: 'badge-warning',
    PAID: 'badge-success',
    FAILED: 'badge-danger',
    REFUNDED: 'badge-info',
  }
  return classes[status] || 'badge-gray'
}

export const getVehicleStatusLabel = (status) => {
  const labels = {
    AVAILABLE: 'Tersedia',
    RENTED: 'Disewa',
    MAINTENANCE: 'Perawatan',
    INACTIVE: 'Nonaktif',
  }
  return labels[status] || status
}

export const getVehicleStatusClass = (status) => {
  const classes = {
    AVAILABLE: 'badge-success',
    RENTED: 'badge-info',
    MAINTENANCE: 'badge-warning',
    INACTIVE: 'badge-gray',
  }
  return classes[status] || 'badge-gray'
}

export const getTransmissionLabel = (t) => {
  const labels = { MANUAL: 'Manual', AUTOMATIC: 'Otomatis', CVT: 'CVT' }
  return labels[t] || t
}

export const getFuelLabel = (f) => {
  const labels = { BENSIN: 'Bensin', DIESEL: 'Diesel', LISTRIK: 'Listrik', HYBRID: 'Hybrid' }
  return labels[f] || f
}

export const getPaymentMethodLabel = (m) => {
  const labels = { BANK_TRANSFER: 'Transfer Bank', E_WALLET: 'E-Wallet', CASH: 'Tunai' }
  return labels[m] || m
}

export const exportToCSV = (data, filename) => {
  if (!data || !data.length) return
  const headers = Object.keys(data[0])
  const rows = data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export const truncate = (str, n = 50) => str?.length > n ? str.substring(0, n) + '...' : str
