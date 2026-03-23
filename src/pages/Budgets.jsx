// src/pages/Budgets.jsx
import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Trash2, Pencil, X,
  Target, AlertTriangle, CheckCircle,
  TrendingDown,
} from 'lucide-react'
import budgetApi from '../api/budget.api'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'
import { formatCurrency } from '../utils/formatters'
import toast from 'react-hot-toast'

// ── Color Options for Budget Cards ────────────────────────────────────────
const COLORS = [
  '#2563eb', '#ef4444', '#f59e0b', '#10b981',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
]

// ── Progress Bar Color ─────────────────────────────────────────────────────
const getProgressColor = (percentage) => {
  if (percentage >= 100) return '#ef4444'  // red — over budget
  if (percentage >= 80)  return '#f59e0b'  // yellow — warning
  return '#10b981'                          // green — healthy
}

// ── Budget Card ────────────────────────────────────────────────────────────
const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const progressColor = getProgressColor(budget.percentage)

  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: '16px',
      padding: '20px', border: '1px solid var(--border)',
      boxShadow: '0 2px 12px var(--shadow)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Color accent bar at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '4px', background: budget.color,
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: '16px',
        marginTop: '4px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: `${budget.color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Target size={20} color={budget.color} />
          </div>
          <div>
            <h3 style={{
              fontSize: '15px', fontWeight: '700',
              color: 'var(--text-primary)', margin: 0,
            }}>
              {budget.category}
            </h3>
            <p style={{
              fontSize: '12px', color: 'var(--text-muted)',
              margin: 0, marginTop: '2px',
            }}>
              Monthly Budget
            </p>
          </div>
        </div>

        {/* Status Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {budget.isOverBudget ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: '#fef2f2', padding: '4px 8px',
              borderRadius: '999px',
            }}>
              <AlertTriangle size={12} color="#ef4444" />
              <span style={{
                fontSize: '11px', fontWeight: '700', color: '#ef4444',
              }}>
                Over Budget
              </span>
            </div>
          ) : budget.percentage >= 80 ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: '#fffbeb', padding: '4px 8px',
              borderRadius: '999px',
            }}>
              <AlertTriangle size={12} color="#f59e0b" />
              <span style={{
                fontSize: '11px', fontWeight: '700', color: '#f59e0b',
              }}>
                Almost There
              </span>
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: '#f0fdf4', padding: '4px 8px',
              borderRadius: '999px',
            }}>
              <CheckCircle size={12} color="#10b981" />
              <span style={{
                fontSize: '11px', fontWeight: '700', color: '#10b981',
              }}>
                On Track
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Amounts */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginBottom: '10px',
      }}>
        <div>
          <p style={{
            fontSize: '11px', color: 'var(--text-muted)',
            margin: 0, fontWeight: '500',
          }}>
            Spent
          </p>
          <p style={{
            fontSize: '18px', fontWeight: '700',
            color: budget.isOverBudget ? '#ef4444' : 'var(--text-primary)',
            margin: 0,
          }}>
            {formatCurrency(budget.spent)}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{
            fontSize: '11px', color: 'var(--text-muted)',
            margin: 0, fontWeight: '500',
          }}>
            Limit
          </p>
          <p style={{
            fontSize: '18px', fontWeight: '700',
            color: 'var(--text-primary)', margin: 0,
          }}>
            {formatCurrency(budget.monthlyLimit)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: '8px', background: 'var(--border)',
        borderRadius: '999px', overflow: 'hidden',
        marginBottom: '8px',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(budget.percentage, 100)}%`,
          background: progressColor,
          borderRadius: '999px',
          transition: 'width 0.6s ease',
        }} />
      </div>

      {/* Progress Text + Remaining */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: '12px', fontWeight: '600',
          color: progressColor,
        }}>
          {budget.percentage}% used
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {budget.isOverBudget
            ? `${formatCurrency(budget.spent - budget.monthlyLimit)} over`
            : `${formatCurrency(budget.remaining)} left`
          }
        </span>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex', gap: '8px', marginTop: '16px',
        paddingTop: '16px', borderTop: '1px solid var(--border)',
      }}>
        <button
          onClick={() => onEdit(budget)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px',
            padding: '8px', background: 'var(--bg-muted)',
            border: 'none', borderRadius: '8px',
            cursor: 'pointer', fontSize: '13px',
            fontWeight: '600', color: 'var(--text-secondary)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e0e7ff'
            e.currentTarget.style.color = '#4f46e5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-muted)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          <Pencil size={14} /> Edit
        </button>
        <button
          onClick={() => onDelete(budget)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px',
            padding: '8px', background: '#fef2f2',
            border: 'none', borderRadius: '8px',
            cursor: 'pointer', fontSize: '13px',
            fontWeight: '600', color: '#ef4444',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ef4444'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fef2f2'
            e.currentTarget.style.color = '#ef4444'
          }}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  )
}

// ── Budget Form ────────────────────────────────────────────────────────────
const BudgetForm = ({ onSubmit, defaultValues, isSubmitting }) => {
  const [category, setCategory]       = useState(defaultValues?.category || '')
  const [monthlyLimit, setMonthlyLimit] = useState(
    defaultValues?.monthlyLimit || ''
  )
  const [color, setColor]             = useState(
    defaultValues?.color || '#2563eb'
  )
  const [error, setError]             = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!category.trim()) {
      setError('Category is required.')
      return
    }
    if (!monthlyLimit || parseFloat(monthlyLimit) <= 0) {
      setError('Please enter a valid amount.')
      return
    }
    onSubmit({ category: category.trim(), monthlyLimit: parseFloat(monthlyLimit), color })
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* Category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{
          fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)',
        }}>
          Category
        </label>
        <input
          type="text"
          placeholder="e.g. Food, Shopping, Transport"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={!!defaultValues}
          style={{
            padding: '10px 14px', border: '1px solid #d1d5db',
            borderRadius: '8px', fontSize: '14px', color: 'var(--text-primary)',
            outline: 'none', boxSizing: 'border-box', width: '100%',
            background: defaultValues ? 'var(--bg-muted)' : 'var(--bg-card)',
            cursor: defaultValues ? 'not-allowed' : 'text',
          }}
          onFocus={(e) => {
            if (!defaultValues) {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#d1d5db'
            e.target.style.boxShadow = 'none'
          }}
        />
        {defaultValues && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            Category cannot be changed after creation.
          </p>
        )}
      </div>

      {/* Monthly Limit */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{
          fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)',
        }}>
          Monthly Limit (₹)
        </label>
        <input
          type="number"
          step="0.01"
          min="1"
          placeholder="e.g. 5000"
          value={monthlyLimit}
          onChange={(e) => setMonthlyLimit(e.target.value)}
          style={{
            padding: '10px 14px', border: '1px solid #d1d5db',
            borderRadius: '8px', fontSize: '14px', color: 'var(--text-primary)',
            outline: 'none', boxSizing: 'border-box', width: '100%',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6'
            e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#d1d5db'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      {/* Color Picker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{
          fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)',
        }}>
          Card Color
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{
                width: '32px', height: '32px',
                minWidth: '32px', minHeight: '32px',
                borderRadius: '50%', background: c,
                border: color === c
                  ? '3px solid var(--text-primary)'
                  : '3px solid transparent',
                cursor: 'pointer', outline: 'none',
                flexShrink: 0, padding: 0,
                transition: 'transform 0.15s ease',
                transform: color === c ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p style={{
          fontSize: '13px', color: '#ef4444',
          margin: 0, padding: '8px 12px',
          background: '#fef2f2', borderRadius: '8px',
        }}>
          {error}
        </p>
      )}

      {/* Submit */}
      <div style={{ paddingTop: '4px' }}>
        <Button type="submit" fullWidth loading={isSubmitting} size="lg">
          {isSubmitting
            ? 'Saving...'
            : defaultValues ? 'Update Budget' : 'Create Budget'
          }
        </Button>
      </div>
    </form>
  )
}

// ── Main Budgets Page ──────────────────────────────────────────────────────
const Budgets = () => {
  const [budgets, setBudgets]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [modalOpen, setModalOpen]       = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting]     = useState(false)

  // ── Fetch Budgets ────────────────────────────────────────────────────
  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true)
      const response = await budgetApi.getAll()
      setBudgets(response.data.data.budgets)
    } catch {
      toast.error('Failed to load budgets.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  // ── Handle Create / Update ───────────────────────────────────────────
  const handleSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      if (editingBudget) {
        await budgetApi.update(editingBudget.id, {
          monthlyLimit: data.monthlyLimit,
          color:        data.color,
        })
        toast.success('Budget updated!')
      } else {
        await budgetApi.create(data)
        toast.success('Budget created!')
      }
      setModalOpen(false)
      setEditingBudget(null)
      fetchBudgets()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Handle Delete ────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteConfirm) return
    setIsDeleting(true)
    try {
      await budgetApi.delete(deleteConfirm.id)
      toast.success('Budget deleted.')
      setDeleteConfirm(null)
      fetchBudgets()
    } catch {
      toast.error('Failed to delete budget.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (budget) => {
    setEditingBudget(budget)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingBudget(null)
  }

  // ── Stats ────────────────────────────────────────────────────────────
  const overBudgetCount  = budgets.filter((b) => b.isOverBudget).length
  const onTrackCount     = budgets.filter(
    (b) => !b.isOverBudget && b.percentage < 80
  ).length
  const warningCount     = budgets.filter(
    (b) => !b.isOverBudget && b.percentage >= 80
  ).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
      }}>
        <div>
          <h2 style={{
            fontSize: '20px', fontWeight: '700',
            color: 'var(--text-primary)', margin: 0,
          }}>
            Budget Goals
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Track your monthly spending limits by category
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="md">
          <Plus size={16} />
          Add Budget
        </Button>
      </div>

      {/* ── Summary Stats ────────────────────────────────────────────── */}
      {!loading && budgets.length > 0 && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            flex: 1, minWidth: '140px',
            background: 'var(--bg-card)', borderRadius: '14px',
            padding: '16px 20px', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#f0fdf4', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle size={20} color="#10b981" />
            </div>
            <div>
              <p style={{
                fontSize: '12px', color: 'var(--text-muted)',
                margin: 0, fontWeight: '500',
              }}>
                On Track
              </p>
              <p style={{
                fontSize: '22px', fontWeight: '700',
                color: 'var(--text-primary)', margin: 0,
              }}>
                {onTrackCount}
              </p>
            </div>
          </div>

          <div style={{
            flex: 1, minWidth: '140px',
            background: 'var(--bg-card)', borderRadius: '14px',
            padding: '16px 20px', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#fffbeb', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={20} color="#f59e0b" />
            </div>
            <div>
              <p style={{
                fontSize: '12px', color: 'var(--text-muted)',
                margin: 0, fontWeight: '500',
              }}>
                Warning
              </p>
              <p style={{
                fontSize: '22px', fontWeight: '700',
                color: 'var(--text-primary)', margin: 0,
              }}>
                {warningCount}
              </p>
            </div>
          </div>

          <div style={{
            flex: 1, minWidth: '140px',
            background: 'var(--bg-card)', borderRadius: '14px',
            padding: '16px 20px', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#fef2f2', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={20} color="#ef4444" />
            </div>
            <div>
              <p style={{
                fontSize: '12px', color: 'var(--text-muted)',
                margin: 0, fontWeight: '500',
              }}>
                Over Budget
              </p>
              <p style={{
                fontSize: '22px', fontWeight: '700',
                color: '#ef4444', margin: 0,
              }}>
                {overBudgetCount}
              </p>
            </div>
          </div>

          <div style={{
            flex: 1, minWidth: '140px',
            background: 'var(--bg-card)', borderRadius: '14px',
            padding: '16px 20px', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#eff6ff', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Target size={20} color="#2563eb" />
            </div>
            <div>
              <p style={{
                fontSize: '12px', color: 'var(--text-muted)',
                margin: 0, fontWeight: '500',
              }}>
                Total Budgets
              </p>
              <p style={{
                fontSize: '22px', fontWeight: '700',
                color: 'var(--text-primary)', margin: 0,
              }}>
                {budgets.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Budget Cards Grid ─────────────────────────────────────────── */}
      {loading ? (
        <div style={{
          display: 'flex', justifyContent: 'center', padding: '60px',
        }}>
          <Spinner size="lg" />
        </div>
      ) : budgets.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', borderRadius: '16px',
          padding: '60px', border: '1px solid var(--border)',
            textAlign: 'center', color: 'var(--text-muted)',
        }}>
          <TrendingDown size={48} style={{
            margin: '0 auto 16px', opacity: 0.2, display: 'block',
          }} />
          <p style={{
            fontSize: '16px', fontWeight: '600',
            color: 'var(--text-secondary)', margin: '0 0 8px',
          }}>
            No budgets set yet
          </p>
          <p style={{ fontSize: '14px', margin: '0 0 24px' }}>
            Set monthly spending limits to track your expenses by category.
          </p>
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Create Your First Budget
          </Button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEdit}
              onDelete={setDeleteConfirm}
            />
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingBudget ? 'Edit Budget' : 'Create Budget'}
        size="sm"
      >
        <BudgetForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          defaultValues={editingBudget ? {
            category:     editingBudget.category,
            monthlyLimit: editingBudget.monthlyLimit,
            color:        editingBudget.color,
          } : null}
        />
      </Modal>

      {/* ── Delete Confirmation Modal ─────────────────────────────────── */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Budget"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{
            fontSize: '14px', color: '#4b5563',
            lineHeight: '1.6', margin: 0,
          }}>
            Are you sure you want to delete the{' '}
            <strong>"{deleteConfirm?.category}"</strong> budget?
            Your transactions won't be affected.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="secondary" fullWidth
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger" fullWidth
              loading={isDeleting}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  )
}

export default Budgets