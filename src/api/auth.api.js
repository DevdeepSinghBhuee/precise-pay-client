// src/api/auth.api.js
import api from './axios'

const authApi = {
  /**
   * POST /auth/register
   */
  register: (data) => api.post('/auth/register', data),

  /**
   * POST /auth/login
   */
  login: (data) => api.post('/auth/login', data),

  /**
   * GET /auth/profile
   * Token auto-attached by request interceptor
   */
  getProfile: () => api.get('/auth/profile'),
}

export default authApi