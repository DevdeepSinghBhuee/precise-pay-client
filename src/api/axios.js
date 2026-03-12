// src/api/axios.js
import axios from 'axios'
import toast from 'react-hot-toast'

// ── Create Axios Instance ──────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout — fail fast
})

// ── Request Interceptor ────────────────────────────────────────────────────
// Runs before EVERY request leaves the browser.
// Reads the token from localStorage and attaches it automatically.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor ───────────────────────────────────────────────────
// Runs after EVERY response comes back.
// Handles global error cases so individual API files stay clean.
api.interceptors.response.use(
  // Success — just return the response as-is
  (response) => response,

  // Error — handle globally
  (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.message || 'Something went wrong.'

    if (status === 401) {
       localStorage.removeItem('token')
       localStorage.removeItem('user')
       toast.error('Your session has expired. Please log in again.')
       window.location.href = '/login'
    } else if (status === 429) {
      toast.error(message)
    } else if (status === 500) {
      toast.error(message)
   }

    return Promise.reject(error)
  }
)

export default api