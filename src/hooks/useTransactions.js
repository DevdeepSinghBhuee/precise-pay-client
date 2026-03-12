// src/hooks/useTransactions.js
import { useState, useEffect, useCallback } from 'react'
import transactionApi from '../api/transaction.api'
import authApi from '../api/auth.api'
import useAuth from './useAuth'
import toast from 'react-hot-toast'

const useTransactions = (filters = {}) => {
  const [transactions, setTransactions]     = useState([])
  const [summary, setSummary]               = useState(null)
  const [pagination, setPagination]         = useState(null)
  const [loading, setLoading]               = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [error, setError]                   = useState(null)

  const { updateUser } = useAuth()

  // ── Fetch Transactions ─────────────────────────────────────────────────
  const fetchTransactions = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const response = await transactionApi.getAll(params)
      const { transactions: data, pagination: pages } = response.data.data
      setTransactions(data)
      setPagination(pages)
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load transactions.')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch Summary ──────────────────────────────────────────────────────
  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true)
      const response = await transactionApi.getSummary()
      setSummary(response.data.data.summary)
    } catch (err) {
      console.error('Failed to load summary:', err)
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  // ── Refresh User Balance in Sidebar ───────────────────────────────────
  // After every mutation, re-fetch profile so sidebar balance updates
  const refreshUserBalance = useCallback(async () => {
    try {
      const response = await authApi.getProfile()
      updateUser(response.data.data.user)
    } catch (err) {
      console.error('Failed to refresh user balance:', err)
    }
  }, [updateUser])

  // ── Create Transaction ─────────────────────────────────────────────────
  const createTransaction = useCallback(async (data) => {
    const response = await transactionApi.create(data)
    await Promise.all([
      fetchTransactions(filters),
      fetchSummary(),
      refreshUserBalance(), // ← updates sidebar balance
    ])
    return response.data.data
  }, [fetchTransactions, fetchSummary, refreshUserBalance, filters])

  // ── Update Transaction ─────────────────────────────────────────────────
  const updateTransaction = useCallback(async (id, data) => {
    const response = await transactionApi.update(id, data)
    await Promise.all([
      fetchTransactions(filters),
      fetchSummary(),
      refreshUserBalance(), // ← updates sidebar balance
    ])
    return response.data.data
  }, [fetchTransactions, fetchSummary, refreshUserBalance, filters])

  // ── Delete Transaction ─────────────────────────────────────────────────
  const deleteTransaction = useCallback(async (id) => {
    await transactionApi.delete(id)
    await Promise.all([
      fetchTransactions(filters),
      fetchSummary(),
      refreshUserBalance(), // ← updates sidebar balance
    ])
  }, [fetchTransactions, fetchSummary, refreshUserBalance, filters])

  // ── Refresh All ────────────────────────────────────────────────────────
  const refresh = useCallback(() => {
    fetchTransactions(filters)
    fetchSummary()
    refreshUserBalance()
  }, [fetchTransactions, fetchSummary, refreshUserBalance, filters])

  // ── Initial Fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchTransactions(filters)
    fetchSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    transactions,
    summary,
    pagination,
    loading,
    summaryLoading,
    error,
    fetchTransactions,
    fetchSummary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refresh,
  }
}

export default useTransactions