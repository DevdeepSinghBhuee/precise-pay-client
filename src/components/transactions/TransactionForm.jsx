// src/components/transactions/TransactionForm.jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TrendingUp, TrendingDown } from 'lucide-react'
import Input from '../common/Input'
import Button from '../common/Button'

// ── Schema ─────────────────────────────────────────────────────────────────
const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], {
    required_error: 'Please select a type.',
  }),
  amount: z.preprocess(
    (val) => {
      if (val === '' || val === undefined || val === null) return undefined
      const parsed = parseFloat(String(val))
      return isNaN(parsed) ? undefined : parsed
    },
    z.number({ invalid_type_error: 'Amount is required.' })
     .positive('Amount must be greater than 0.')
  ),
  description: z.string().min(1, 'Description is required.').max(255),
  category:    z.string().max(100).optional(),
  date:        z.string().min(1, 'Date is required.'),
  notes:       z.string().max(1000).optional(),
})

// ── TransactionForm Component ──────────────────────────────────────────────
const TransactionForm = ({ onSubmit, defaultValues, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: defaultValues || {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedType = watch('type')

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* Type Selector */}
      <div>
        <label style={{
          fontSize: '14px', fontWeight: '500',
          color: '#374151', display: 'block', marginBottom: '8px',
        }}>
          Transaction Type
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['income', 'expense'].map((type) => (
            <label key={type} style={{
              flex: 1, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
              padding: '10px', borderRadius: '10px', cursor: 'pointer',
              border: selectedType === type
                ? type === 'income' ? '2px solid #16a34a' : '2px solid #dc2626'
                : '2px solid #e5e7eb',
              background: selectedType === type
                ? type === 'income' ? '#f0fdf4' : '#fef2f2'
                : '#f9fafb',
              fontSize: '14px', fontWeight: '600',
              color: selectedType === type
                ? type === 'income' ? '#16a34a' : '#dc2626'
                : '#6b7280',
              transition: 'all 0.15s ease',
            }}>
              <input
                type="radio"
                value={type}
                {...register('type')}
                style={{ display: 'none' }}
              />
              {type === 'income'
                ? <TrendingUp size={16} />
                : <TrendingDown size={16} />
              }
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>
        {errors.type && (
          <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
            {errors.type.message}
          </p>
        )}
      </div>

      {/* Amount — raw input so step=0.01 works reliably */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{
          fontSize: '14px', fontWeight: '500', color: '#374151',
        }}>
          Amount (₹)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          {...register('amount')}
          style={{
            width: '100%', padding: '10px 14px',
            border: '1px solid #d1d5db', borderRadius: '8px',
            fontSize: '14px', color: '#111827',
            outline: 'none', boxSizing: 'border-box',
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
        {errors.amount && (
          <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Description */}
      <Input
        label="Description"
        type="text"
        placeholder="e.g. Monthly salary"
        register={register('description')}
        error={errors.description?.message}
      />

      {/* Category + Date */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <Input
          label="Category"
          type="text"
          placeholder="e.g. Salary"
          register={register('category')}
          error={errors.category?.message}
        />
        <Input
          label="Date"
          type="date"
          register={register('date')}
          error={errors.date?.message}
        />
      </div>

      {/* Notes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{
          fontSize: '14px', fontWeight: '500', color: '#374151',
        }}>
          Notes (optional)
        </label>
        <textarea
          {...register('notes')}
          placeholder="Any additional notes..."
          rows={3}
          style={{
            width: '100%', borderRadius: '8px',
            border: '1px solid #d1d5db', padding: '10px 14px',
            fontSize: '14px', color: '#111827',
            resize: 'vertical', outline: 'none',
            fontFamily: 'inherit', boxSizing: 'border-box',
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

      {/* Submit */}
      <div style={{ paddingTop: '4px' }}>
        <Button type="submit" fullWidth loading={isSubmitting} size="lg">
          {isSubmitting
            ? 'Saving...'
            : defaultValues ? 'Update Transaction' : 'Add Transaction'
          }
        </Button>
      </div>
    </form>
  )
}

export default TransactionForm