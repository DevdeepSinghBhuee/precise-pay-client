// src/components/transactions/TransactionList.jsx
import { ArrowLeftRight } from 'lucide-react'
import TransactionCard from './TransactionCard'
import Spinner from '../common/Spinner'

// ── Table Header ───────────────────────────────────────────────────────────
const TableHeader = () => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    padding: '12px 24px',
    background: '#f9fafb',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '11px', fontWeight: '700',
    color: '#9ca3af', textTransform: 'uppercase',
    letterSpacing: '0.6px',
  }}>
    <span>Description</span>
    <span>Category / Date</span>
    <span>Amount</span>
    <span style={{ textAlign: 'right' }}>Actions</span>
  </div>
)

// ── Empty State ────────────────────────────────────────────────────────────
const EmptyState = ({ hasFilters }) => (
  <div style={{
    textAlign: 'center', padding: '60px', color: '#9ca3af',
  }}>
    <ArrowLeftRight size={48} style={{
      margin: '0 auto 16px', opacity: 0.2,
      display: 'block',
    }} />
    <p style={{ fontSize: '15px', fontWeight: '500', margin: 0 }}>
      No transactions found.
    </p>
    <p style={{ fontSize: '13px', marginTop: '6px', margin: '6px 0 0' }}>
      {hasFilters
        ? 'Try adjusting your filters.'
        : 'Add your first transaction to get started.'
      }
    </p>
  </div>
)

// ── TransactionList Component ──────────────────────────────────────────────
const TransactionList = ({
  transactions,
  loading,
  hasFilters,
  onEdit,
  onDelete,
}) => {
  return (
    <div style={{
      background: '#ffffff', borderRadius: '16px',
      border: '1px solid #f3f4f6',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      overflow: 'hidden',
    }}>
      <TableHeader />

      {loading ? (
        <div style={{
          display: 'flex', justifyContent: 'center', padding: '60px',
        }}>
          <Spinner size="lg" />
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        transactions.map((t, index) => (
          <TransactionCard
            key={t.id}
            transaction={t}
            onEdit={onEdit}
            onDelete={onDelete}
            isLast={index === transactions.length - 1}
          />
        ))
      )}
    </div>
  )
}

export default TransactionList