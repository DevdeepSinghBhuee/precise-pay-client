// src/pages/Transactions.jsx
import { useState, useCallback } from 'react'
import {
  Plus, Search, Filter,
  ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import useTransactions from '../hooks/useTransactions'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'
import TransactionForm from '../components/transactions/TransactionForm'
import TransactionList from '../components/transactions/TransactionList'
// eslint-disable-next-line no-unused-vars
import { formatCurrency } from '../utils/formatters'
import toast from 'react-hot-toast'

// ── Main Transactions Page ─────────────────────────────────────────────────
const Transactions = () => {
  const [modalOpen, setModalOpen]         = useState(false)
  const [editingTx, setEditingTx]         = useState(null)
  const [deletingId, setDeletingId]       = useState(null)
  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [isDeleting, setIsDeleting]       = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [searchTerm, setSearchTerm]       = useState('')
  const [filterType, setFilterType]       = useState('')
  const [currentPage, setCurrentPage]     = useState(1)

  const {
    transactions, pagination, loading,
    fetchTransactions, createTransaction,
    updateTransaction, deleteTransaction,
  } = useTransactions()

  // ── Apply Filters ──────────────────────────────────────────────────────
  const applyFilters = useCallback((page = 1) => {
    const params = { page, limit: 10 }
    if (filterType) params.type = filterType
    setCurrentPage(page)
    fetchTransactions(params)
  }, [filterType, fetchTransactions])

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

  // ── Open Edit Modal ────────────────────────────────────────────────────
  const handleEdit = (transaction) => {
    setEditingTx(transaction)
    setModalOpen(true)
  }

  // ── Close Modal ────────────────────────────────────────────────────────
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
            color: '#111827', margin: 0,
          }}>
            All Transactions
          </h2>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '2px' }}>
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
        background: '#ffffff', borderRadius: '14px',
        padding: '16px 20px', border: '1px solid #f3f4f6',
        display: 'flex', gap: '12px', flexWrap: 'wrap',
        alignItems: 'center',
      }}>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{
            position: 'absolute', left: '12px',
            top: '50%', transform: 'translateY(-50%)',
            color: '#9ca3af', pointerEvents: 'none',
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
              border: '1px solid #e5e7eb', borderRadius: '8px',
              fontSize: '14px', outline: 'none', color: '#111827',
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
                cursor: 'pointer', color: '#9ca3af',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#9ca3af" />
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value)
              const params = { page: 1, limit: 10 }
              if (e.target.value) params.type = e.target.value
              setCurrentPage(1)
              fetchTransactions(params)
            }}
            style={{
              padding: '10px 14px', border: '1px solid #e5e7eb',
              borderRadius: '8px', fontSize: '14px',
              outline: 'none', color: '#111827',
              background: '#ffffff', cursor: 'pointer',
            }}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(filterType || searchTerm) && (
          <button
            onClick={() => {
              setFilterType('')
              setSearchTerm('')
              fetchTransactions({ page: 1, limit: 10 })
            }}
            style={{
              background: 'none', border: '1px solid #e5e7eb',
              borderRadius: '8px', padding: '10px 14px',
              fontSize: '13px', color: '#6b7280',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: '6px',
            }}
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* ── Transactions List ─────────────────────────────────────────── */}
      <TransactionList
        transactions={filteredTransactions}
        loading={loading}
        hasFilters={!!(searchTerm || filterType)}
        onEdit={handleEdit}
        onDelete={setDeleteConfirm}
      />

      {/* ── Pagination ────────────────────────────────────────────────── */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff', borderRadius: '12px',
          padding: '12px 20px', border: '1px solid #f3f4f6',
        }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
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
            fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: 0,
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