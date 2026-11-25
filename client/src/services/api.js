import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('velox_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('velox_token')
      localStorage.removeItem('velox_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

// Vehicles
export const vehicleAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/vehicles/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/vehicles/${id}`),
  deleteImage: (vehicleId, imageId) => api.delete(`/vehicles/${vehicleId}/images/${imageId}`),
}

// Categories
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

// Bookings
export const bookingAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  updateStatus: (id, data) => api.patch(`/bookings/${id}/status`, data),
}

// Payments
export const paymentAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  uploadProof: (id, data) => api.post(`/payments/${id}/proof`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateStatus: (id, data) => api.patch(`/payments/${id}/status`, data),
}

// Profile
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/profile/password', data),
}

// Admin
export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  reports: (params) => api.get('/admin/reports', { params }),
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getCustomerDetail: (id) => api.get(`/admin/customers/${id}`),
  toggleCustomer: (id) => api.patch(`/admin/customers/${id}/toggle`),
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
}

export default api
