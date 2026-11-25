export const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-16 w-16' }
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizes[size]}`}></div>
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  )
}

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-500">Memuat...</p>
    </div>
  </div>
)

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-16">
    {Icon && <Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
    {description && <p className="text-gray-500 mb-6 text-sm">{description}</p>}
    {action}
  </div>
)

export const ErrorState = ({ message = 'Terjadi kesalahan', onRetry }) => (
  <div className="text-center py-16">
    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-2xl">⚠️</span>
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">Gagal memuat data</h3>
    <p className="text-gray-500 text-sm mb-6">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-primary text-sm px-4 py-2">Coba Lagi</button>
    )}
  </div>
)

export const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.totalPages <= 1) return null
  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1)
  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-gray-500">
        Menampilkan {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} dari {meta.total} data
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(meta.page - 1)}
          disabled={meta.page === 1}
          className="px-3 py-1 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
        >‹</button>
        {pages.slice(Math.max(0, meta.page - 3), Math.min(pages.length, meta.page + 2)).map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 rounded-lg border text-sm ${p === meta.page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}
          >{p}</button>
        ))}
        <button
          onClick={() => onPageChange(meta.page + 1)}
          disabled={meta.page === meta.totalPages}
          className="px-3 py-1 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
        >›</button>
      </div>
    </div>
  )
}

export const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Konfirmasi', confirmClass = 'btn-danger' }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 text-sm">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary text-sm px-4 py-2">Batal</button>
          <button onClick={onConfirm} className={`${confirmClass} text-sm px-4 py-2`}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl ${sizes[size]} w-full max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span className="text-gray-500 text-xl">✕</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
