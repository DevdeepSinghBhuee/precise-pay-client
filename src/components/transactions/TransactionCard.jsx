// src/components/transactions/TransactionCard.jsx
import { TrendingUp, TrendingDown, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/formatters'

// ── Category Badge ─────────────────────────────────────────────────────────
const CategoryBadge = ({ category }) => {
  if (!category) return (
    <span style={{ color: '#d1d5db', fontSize: '13px' }}>—</span>
  )

  const colorMap = {
    salary:    { bg: '#eff6ff', color: '#2563eb' },
    food:      { bg: '#fef3c7', color: '#d97706' },
    shopping:  { bg: '#fdf2f8', color: '#9333ea' },
    housing:   { bg: '#f0fdf4', color: '#16a34a' },
    transport: { bg: '#fff7ed', color: '#ea580c' },
  }
  const key    = category.toLowerCase()
  const colors = colorMap[key] || { bg: '#f3f4f6', color: '#6b7280' }

  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: '600',
      background: colors.bg,
      color: colors.color,
      whiteSpace: 'nowrap',
    }}>
      {category}
    </span>
  )
}

// ── Transaction Card ───────────────────────────────────────────────────────
const TransactionCard = ({ transaction: t, onEdit, onDelete, isLast }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        padding: '16px 24px',
        alignItems: 'center',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-hover)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {/* Col 1 — Icon + Description */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          flexShrink: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: t.type === 'income' ? '#f0fdf4' : '#fef2f2',
        }}>
          {t.type === 'income'
            ? <TrendingUp size={18} color="#16a34a" />
            : <TrendingDown size={18} color="#dc2626" />
          }
        </div>
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <p style={{
              fontSize: '14px', fontWeight: '600',
              color: 'var(--text-primary)', margin: 0,
            }}>
              {t.description}
            </p>
            {/* Recurring Badge */}
            {t.isRecurring && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '3px',
                padding: '2px 7px', borderRadius: '999px',
                fontSize: '11px', fontWeight: '600',
                background: '#eff6ff', color: '#2563eb',
                flexShrink: 0,
              }}>
                <RefreshCw size={10} />
                Monthly
              </span>
            )}
          </div>
          {t.notes && (
            <p style={{
              fontSize: '12px', color: 'var(--text-muted)',
              margin: 0, marginTop: '2px',
            }}>
              {t.notes}
            </p>
          )}
        </div>
      </div>

      {/* Col 2 — Category + Date stacked */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        gap: '4px', alignItems: 'flex-start',
      }}>
        <CategoryBadge category={t.category} />
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
          {formatDate(t.date)}
        </span>
      </div>

      {/* Col 3 — Amount */}
      <div>
        <span style={{
          fontSize: '16px', fontWeight: '700',
          color: t.type === 'income' ? '#16a34a' : '#dc2626',
        }}>
          {t.type === 'income' ? '+' : '-'}
          {formatCurrency(t.amount)}
        </span>
        <p style={{
          fontSize: '11px', fontWeight: '500',
          color: t.type === 'income' ? '#86efac' : '#fca5a5',
          margin: 0, marginTop: '2px',
          textTransform: 'uppercase', letterSpacing: '0.4px',
        }}>
          {t.type}
        </p>
      </div>

      {/* Col 4 — Actions */}
      <div style={{
        display: 'flex', gap: '8px', justifyContent: 'flex-end',
      }}>
        <button
          onClick={() => onEdit(t)}
          title="Edit"
          style={{
            background: '#f3f4f6', border: 'none',
            borderRadius: '8px', padding: '8px',
            cursor: 'pointer', color: '#6b7280',
            display: 'flex', alignItems: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e0e7ff'
            e.currentTarget.style.color = '#4f46e5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f3f4f6'
            e.currentTarget.style.color = '#6b7280'
          }}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(t)}
          title="Delete"
          style={{
            background: '#fef2f2', border: 'none',
            borderRadius: '8px', padding: '8px',
            cursor: 'pointer', color: '#ef4444',
            display: 'flex', alignItems: 'center',
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
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export default TransactionCard