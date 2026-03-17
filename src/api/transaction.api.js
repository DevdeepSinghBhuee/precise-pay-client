// src/api/transaction.api.js
import api from './axios'

const transactionApi = {
  /**
   * POST /transactions
   */
  create: (data) => api.post('/transactions', data),

  /**
   * GET /transactions?type=&page=&limit=
   */
  getAll: (params = {}) => api.get('/transactions', { params }),

  /**
   * GET /transactions/:id
   */
  getOne: (id) => api.get(`/transactions/${id}`),

  /**
   * PATCH /transactions/:id
   */
  update: (id, data) => api.patch(`/transactions/${id}`, data),

  /**
   * DELETE /transactions/:id
   */
  delete: (id) => api.delete(`/transactions/${id}`),

  /**
   * GET /transactions/summary
   */
  getSummary: (params = {}) => api.get('/transactions/summary', { params }),
}

export default transactionApi