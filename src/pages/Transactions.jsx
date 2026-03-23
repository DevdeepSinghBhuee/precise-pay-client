// src/pages/Transactions.jsx
import { useState, useCallback, useEffect } from 'react'
import {
  Plus, Search, Filter, Trash2, Pencil,
  ChevronLeft, ChevronRight, X,
  Calendar, SlidersHorizontal,
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import useTransactions from '../hooks/useTransactions'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'
import TransactionForm from '../components/transactions/TransactionForm'
import TransactionList from '../components/transactions/TransactionList'
import toast from 'react-hot-toast'

// ── Date Preset Helpers ────────────────────────────────────────────────────
const getDatePreset = (preset) => {
  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth()

  switch (preset) {
    case 'this_month':
      return {
        startDate: new Date(year, month, 1).toISOString().split('T')[0],
        endDate:   new Date(year, month + 1, 0).toISOString().split('T')[0],
      }
    case 'last_month':
      return {
        startDate: new Date(year, month - 1, 1).toISOString().split('T')[0],
        endDate:   new Date(year, month, 0).toISOString().split('T')[0],
      }
    case 'last_3_months':
      return {
        startDate: new Date(year, month - 2, 1).toISOString().split('T')[0],
        endDate:   new Date(year, month + 1, 0).toISOString().split('T')[0],
      }
    case 'this_year':
      return {
        startDate: new Date(year, 0, 1).toISOString().split('T')[0],
        endDate:   new Date(year, 11, 31).toISOString().split('T')[0],
      }
    default:
      return { startDate: '', endDate: '' }
  }
}

// ── Main Transactions Page ─────────────────────────────────────────────────
const Transactions = () => {
  const [modalOpen, setModalOpen]           = useState(false)
  const [editingTx, setEditingTx]           = useState(null)
  const [deletingId, setDeletingId]         = useState(null)
  const [isSubmitting, setIsSubmitting]     = useState(false)
  const [isDeleting, setIsDeleting]         = useState(false)
  const [deleteConfirm, setDeleteConfirm]   = useState(null)
  const [currentPage, setCurrentPage]       = useState(1)

  // ── Filter States ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm]         = useState('')
  const [filterType, setFilterType]         = useState('')
  const [datePreset, setDatePreset]         = useState('')
  const [startDate, setStartDate]           = useState('')
  const [endDate, setEndDate]               = useState('')
  const [showCustomDate, setShowCustomDate] = useState(false)
  const [minAmount, setMinAmount]           = useState('')
  const [maxAmount, setMaxAmount]           = useState('')
  const [showAdvanced, setShowAdvanced]     = useState(false)

  const location = useLocation()

  const {
    transactions, pagination, loading,
    fetchTransactions, createTransaction,
    updateTransaction, deleteTransaction,
  } = useTransactions()

  // ── Auto-open modal ────────────────────────────────────────────────────
  useEffect(() => {
    if (location.state?.openModal) {
      setModalOpen(true)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  // ── Build params from all active filters ──────────────────────────────
  const buildParams = useCallback((page = 1) => {
    const params = { page, limit: 10 }
    if (filterType) params.type      = filterType
    if (startDate)  params.startDate = startDate
    if (endDate)    params.endDate   = endDate
    if (minAmount)  params.minAmount = minAmount
    if (maxAmount)  params.maxAmount = maxAmount
    return params
  }, [filterType, startDate, endDate, minAmount, maxAmount])

  // ── Apply Filters ──────────────────────────────────────────────────────
  const applyFilters = useCallback((page = 1) => {
    setCurrentPage(page)
    fetchTransactions(buildParams(page))
  }, [buildParams, fetchTransactions])

  // ── Handle Date Preset ─────────────────────────────────────────────────
  const handlePreset = (preset) => {
    setDatePreset(preset)
    if (preset === 'custom') {
      setShowCustomDate(true)
      return
    }
    setShowCustomDate(false)
    const { startDate: sd, endDate: ed } = getDatePreset(preset)
    setStartDate(sd)
    setEndDate(ed)
    setCurrentPage(1)
    const params = { page: 1, limit: 10 }
    if (filterType)  params.type      = filterType
    if (sd)          params.startDate = sd
    if (ed)          params.endDate   = ed
    if (minAmount)   params.minAmount = minAmount
    if (maxAmount)   params.maxAmount = maxAmount
    fetchTransactions(params)
  }

  // ── Handle Custom Date Apply ───────────────────────────────────────────
  const handleCustomDateApply = () => {
    if (!startDate && !endDate) return
    setCurrentPage(1)
    fetchTransactions(buildParams(1))
    setShowCustomDate(false)
  }

  // ── Handle Amount Filter Apply ─────────────────────────────────────────
  const handleAmountApply = () => {
    setCurrentPage(1)
    fetchTransactions(buildParams(1))
  }

  // ── Clear All Filters ──────────────────────────────────────────────────
  const clearAllFilters = () => {
    setFilterType('')
    setSearchTerm('')
    setDatePreset('')
    setStartDate('')
    setEndDate('')
    setShowCustomDate(false)
    setMinAmount('')
    setMaxAmount('')
    setCurrentPage(1)
    fetchTransactions({ page: 1, limit: 10 })
  }

  const hasActiveFilters = filterType || searchTerm ||
                           startDate  || endDate    ||
                           minAmount  || maxAmount

  const hasAdvancedFilters = minAmount || maxAmount

  // ── Handle Create / Update ─────────────────────────────────────────────
  const handleSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      if (editingTx) {
        await updateTransaction(editingTx.id, data)
        toast.success('Transaction updated!')
      } else {
        await createTransaction(data)
        toast.success('Transaction added!')
      }
      setModalOpen(false)
      setEditingTx(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Handle Delete ──────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setIsDeleting(true)
    setDeletingId(id)
    try {
      await deleteTransaction(id)
      toast.success('Transaction deleted.')
      setDeleteConfirm(null)
    } catch {
      toast.error('Failed to delete transaction.')
    } finally {
      setIsDeleting(false)
      setDeletingId(null)
    }
  }

  const handleEdit = (transaction) => {
    setEditingTx(transaction)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingTx(null)
  }

  // ── Client-side search filter ──────────────────────────────────────────
  const filteredTransactions = transactions.filter((t) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      t.description.toLowerCase().includes(term) ||
      (t.category && t.category.toLowerCase().includes(term))
    )
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

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
            All Transactions
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {pagination
              ? `${pagination.total} total transactions`
              : 'Loading...'
            }
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="md">
          <Plus size={16} />
          Add Transaction
        </Button>
      </div>

      {/* ── Filters Bar ──────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: '14px',
        padding: '16px 20px', border: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', gap: '12px',
      }}>

        {/* Row 1 — Search + Type + Advanced Toggle + Clear */}
        <div style={{
          display: 'flex', gap: '12px',
          flexWrap: 'wrap', alignItems: 'center',
        }}>

          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{
              position: 'absolute', left: '12px',
              top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Search by description or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', paddingLeft: '38px',
                paddingRight: '14px', paddingTop: '10px',
                paddingBottom: '10px',
                border: '1px solid var(--border-input)', borderRadius: '8px',
                fontSize: '14px', outline: 'none', color: 'var(--text-primary)',
                boxSizing: 'border-box',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute', right: '10px',
                  top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--text-muted)',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value)
                setCurrentPage(1)
                const params = buildParams(1)
                params.type = e.target.value || undefined
                fetchTransactions({ ...params, type: e.target.value })
              }}
              style={{
                padding: '10px 14px', border: '1px solid var(--border-input)',
                borderRadius: '8px', fontSize: '14px',
                outline: 'none', color: 'var(--text-primary)',
                background: 'var(--bg-card)', cursor: 'pointer',
              }}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 14px',
              border: '1px solid',
              borderColor: showAdvanced || hasAdvancedFilters
                ? '#2563eb' : 'var(--border-input)',
              borderRadius: '8px', fontSize: '13px',
              fontWeight: '600',
              color: showAdvanced || hasAdvancedFilters
                ? '#2563eb' : 'var(--text-secondary)',
              background: showAdvanced || hasAdvancedFilters
                ? '#eff6ff' : 'var(--bg-card)',
              cursor: 'pointer',
            }}
          >
            <SlidersHorizontal size={14} />
            Advanced
            {hasAdvancedFilters && (
              <span style={{
                background: '#2563eb', color: 'white',
                borderRadius: '999px', fontSize: '11px',
                fontWeight: '700', padding: '1px 6px',
              }}>
                ON
              </span>
            )}
          </button>

          {/* Clear All */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              style={{
                background: 'none', border: '1px solid var(--border-input)',
                borderRadius: '8px', padding: '10px 14px',
                fontSize: '13px', color: 'var(--text-secondary)',
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: '6px',
              }}
            >
              <X size={14} /> Clear All
            </button>
          )}
        </div>

        {/* Row 2 — Date Presets */}
        <div style={{
          display: 'flex', gap: '8px',
          flexWrap: 'wrap', alignItems: 'center',
        }}>
          <Calendar size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          {[
            { value: 'this_month',    label: 'This Month' },
            { value: 'last_month',    label: 'Last Month' },
            { value: 'last_3_months', label: 'Last 3 Months' },
            { value: 'this_year',     label: 'This Year' },
            { value: 'custom',        label: 'Custom Range' },
          ].map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePreset(preset.value)}
              style={{
                padding: '6px 14px', borderRadius: '999px',
                fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', border: '1px solid',
                borderColor: datePreset === preset.value
                  ? '#2563eb' : 'var(--border-input)',
                background: datePreset === preset.value
                  ? '#eff6ff' : 'var(--bg-card)',
                color: datePreset === preset.value
                  ? '#2563eb' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              {preset.label}
            </button>
          ))}
          {(startDate && endDate && datePreset !== 'custom') && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {startDate} → {endDate}
            </span>
          )}
        </div>

        {/* Row 3 — Custom Date Range */}
        {showCustomDate && (
          <div style={{
            display: 'flex', gap: '12px',
            alignItems: 'center', flexWrap: 'wrap',
            padding: '12px 16px', background: 'var(--bg-muted)',
            borderRadius: '10px', border: '1px solid var(--border-input)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <label style={{
                fontSize: '13px', fontWeight: '500', color: '#374151',
              }}>
                From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: '8px 12px', border: '1px solid #d1d5db',
                  borderRadius: '8px', fontSize: '13px',
                  outline: 'none', color: '#111827',
                }}
              />
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <label style={{
                fontSize: '13px', fontWeight: '500', color: '#374151',
              }}>
                To
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: '8px 12px', border: '1px solid #d1d5db',
                  borderRadius: '8px', fontSize: '13px',
                  outline: 'none', color: '#111827',
                }}
              />
            </div>
            <Button
              size="sm"
              onClick={handleCustomDateApply}
              disabled={!startDate && !endDate}
            >
              Apply
            </Button>
            <button
              onClick={() => {
                setShowCustomDate(false)
                setDatePreset('')
                setStartDate('')
                setEndDate('')
              }}
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--text-muted)',
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Row 4 — Advanced Filters (Amount Range) */}
        {showAdvanced && (
          <div style={{
            display: 'flex', gap: '16px',
            alignItems: 'flex-end', flexWrap: 'wrap',
            padding: '16px', background: 'var(--bg-muted)',
            borderRadius: '10px', border: '1px solid var(--border-input)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: '6px', marginBottom: '2px',
            }}>
              <SlidersHorizontal size={14} color="var(--text-secondary)" />
              <span style={{
                fontSize: '13px', fontWeight: '600', color: '#374151',
              }}>
                Amount Range (₹)
              </span>
            </div>

            {/* Min Amount */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '4px',
            }}>
              <label style={{
                fontSize: '12px', fontWeight: '500', color: '#6b7280',
              }}>
                Min Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 500"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                style={{
                  padding: '8px 12px', border: '1px solid #d1d5db',
                  borderRadius: '8px', fontSize: '13px',
                  outline: 'none', color: '#111827', width: '140px',
                }}
              />
            </div>

            {/* Max Amount */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '4px',
            }}>
              <label style={{
                fontSize: '12px', fontWeight: '500', color: '#6b7280',
              }}>
                Max Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 5000"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                style={{
                  padding: '8px 12px', border: '1px solid #d1d5db',
                  borderRadius: '8px', fontSize: '13px',
                  outline: 'none', color: '#111827', width: '140px',
                }}
              />
            </div>

            <Button size="sm" onClick={handleAmountApply}>
              Apply
            </Button>

            {hasAdvancedFilters && (
              <button
                onClick={() => {
                  setMinAmount('')
                  setMaxAmount('')
                  setCurrentPage(1)
                  const params = buildParams(1)
                  delete params.minAmount
                  delete params.maxAmount
                  fetchTransactions(params)
                }}
                style={{
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--text-muted)',
                  fontSize: '13px', display: 'flex',
                  alignItems: 'center', gap: '4px',
                }}
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Transactions List ─────────────────────────────────────────── */}
      <TransactionList
        transactions={filteredTransactions}
        loading={loading}
        hasFilters={!!hasActiveFilters}
        onEdit={handleEdit}
        onDelete={setDeleteConfirm}
      />

      {/* ── Pagination ────────────────────────────────────────────────── */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)', borderRadius: '12px',
          padding: '12px 20px', border: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Page {currentPage} of {pagination.totalPages}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="secondary" size="sm"
              disabled={currentPage === 1}
              onClick={() => applyFilters(currentPage - 1)}
            >
              <ChevronLeft size={16} /> Prev
            </Button>
            <Button
              variant="secondary" size="sm"
              disabled={currentPage === pagination.totalPages}
              onClick={() => applyFilters(currentPage + 1)}
            >
              Next <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingTx ? 'Edit Transaction' : 'Add Transaction'}
        size="md"
      >
        <TransactionForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          defaultValues={editingTx ? {
            type:        editingTx.type,
            amount:      parseFloat(editingTx.amount),
            description: editingTx.description,
            category:    editingTx.category || '',
            date:        editingTx.date,
            notes:       editingTx.notes || '',
            isRecurring:  editingTx.isRecurring || false,
            recurringDay: editingTx.recurringDay || '',
          } : null}
        />
      </Modal>

      {/* ── Delete Confirmation Modal ─────────────────────────────────── */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Transaction"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{
            fontSize: '14px', color: '#4b5563',
            lineHeight: '1.6', margin: 0,
          }}>
            Are you sure you want to delete{' '}
            <strong>"{deleteConfirm?.description}"</strong>?
            This action cannot be undone.
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
              loading={isDeleting && deletingId === deleteConfirm?.id}
              onClick={() => handleDelete(deleteConfirm.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  )
}

export default Transactions