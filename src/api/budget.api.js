// src/api/budget.api.js
import api from './axios'

const budgetApi = {
  getAll:  ()         => api.get('/budgets'),
  create:  (data)     => api.post('/budgets', data),
  update:  (id, data) => api.patch(`/budgets/${id}`, data),
  delete:  (id)       => api.delete(`/budgets/${id}`),
}

export default budgetApi