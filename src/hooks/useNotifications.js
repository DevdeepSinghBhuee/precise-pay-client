// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react'
import budgetApi from '../api/budget.api'
import transactionApi from '../api/transaction.api'

const useNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const [unreadCount, setUnreadCount]     = useState(0)

  const generateNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const [budgetRes, txRes] = await Promise.all([
        budgetApi.getAll(),
        transactionApi.getAll({ limit: 5, page: 1 }),
      ])

      const budgets      = budgetRes.data.data.budgets || []
      const transactions = txRes.data.data.transactions || []
      const notes        = []

      // ── Budget Alerts ──────────────────────────────────────────────
      budgets.forEach((b) => {
        if (b.isOverBudget) {
          notes.push({
            id:      `budget-over-${b.id}`,
            type:    'danger',
            title:   `Over Budget: ${b.category}`,
            message: `You've exceeded your ₹${parseFloat(b.monthlyLimit).toLocaleString('en-IN')} limit.`,
            time:    'This month',
            read:    false,
          })
        } else if (b.percentage >= 80) {
          notes.push({
            id:      `budget-warn-${b.id}`,
            type:    'warning',
            title:   `Budget Warning: ${b.category}`,
            message: `${b.percentage}% of your monthly limit used.`,
            time:    'This month',
            read:    false,
          })
        }
      })

      // ── Recent Transaction Alerts ──────────────────────────────────
      transactions.slice(0, 3).forEach((t) => {
        notes.push({
          id:      `tx-${t.id}`,
          type:    t.type === 'income' ? 'success' : 'info',
          title:   t.type === 'income' ? 'Income Received' : 'Expense Recorded',
          message: `${t.description} — ₹${parseFloat(t.amount).toLocaleString('en-IN')}`,
          time:    t.date,
          read:    true,
        })
      })

      // ── Low Balance Alert ──────────────────────────────────────────
      const summary = await transactionApi.getSummary()
      const balance = parseFloat(summary.data.data.summary.balance)
      if (balance < 500 && balance >= 0) {
        notes.unshift({
          id:      'low-balance',
          type:    'warning',
          title:   'Low Balance Alert',
          message: `Your balance is ₹${balance.toLocaleString('en-IN')}. Consider adding income.`,
          time:    'Now',
          read:    false,
        })
      } else if (balance < 0) {
        notes.unshift({
          id:      'negative-balance',
          type:    'danger',
          title:   'Negative Balance',
          message: `Your balance is negative. Review your expenses.`,
          time:    'Now',
          read:    false,
        })
      }

      setNotifications(notes)
      setUnreadCount(notes.filter((n) => !n.read).length)
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  useEffect(() => {
    generateNotifications()
  }, [generateNotifications])

  return { notifications, loading, unreadCount, markAllRead, refresh: generateNotifications }
}

export default useNotifications
