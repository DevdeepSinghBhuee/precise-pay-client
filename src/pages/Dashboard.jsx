// src/pages/Dashboard.jsx
import { useMemo, useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Wallet,
  ArrowUpRight, ArrowDownRight, Plus,
  ArrowLeftRight, Calendar,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useTransactions from '../hooks/useTransactions'
import { formatCurrency, formatDate } from '../utils/formatters'
import Spinner from '../components/common/Spinner'

// ── Pie Chart Colors ───────────────────────────────────────────────────────
const PIE_COLORS = [
  '#2563eb', '#ef4444', '#f59e0b', '#10b981',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
  '#6366f1', '#84cc16',
]

// ── Date Preset Helper ─────────────────────────────────────────────────────
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

// ── Date Presets Config ────────────────────────────────────────────────────
const DATE_PRESETS = [
  { value: 'all',          label: 'All Time' },
  { value: 'this_month',   label: 'This Month' },
  { value: 'last_month',   label: 'Last Month' },
  { value: 'last_3_months',label: 'Last 3 Months' },
  { value: 'this_year',    label: 'This Year' },
]

// ── Summary Card ───────────────────────────────────────────────────────────
const SummaryCard = ({ title, amount, icon, bgColor, trend }) => (
  <div style={{
    background: 'var(--bg-card)', borderRadius: '16px',
    padding: '20px', border: '1px solid var(--border)',
    boxShadow: '0 2px 12px var(--shadow)',
    flex: 1, minWidth: '200px',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: '12px',
    }}>
      <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
        {title}
      </span>
      <div style={{
        width: '40px', height: '40px', borderRadius: '12px',
        background: bgColor, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
      {formatCurrency(amount || 0)}
    </div>
    {trend && (
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '4px', marginTop: '6px',
      }}>
        {trend === 'up'
          ? <ArrowUpRight size={14} color="#16a34a" />
          : <ArrowDownRight size={14} color="#dc2626" />
        }
        <span style={{
          fontSize: '12px',
          color: trend === 'up' ? '#16a34a' : '#dc2626',
        }}>
          {trend === 'up' ? 'Income' : 'Expense'}
        </span>
      </div>
    )}
  </div>
)

// ── Income Left Card ───────────────────────────────────────────────────────
const IncomeLeftCard = ({ summary, periodLabel }) => {
  if (!summary) return null

  const income   = parseFloat(summary.totalIncome  || 0)
  const expenses = parseFloat(summary.totalExpenses || 0)
  const left     = income - expenses
  const isPositive = left >= 0
  const percentage = income > 0
    ? Math.min(100, Math.round((expenses / income) * 100))
    : expenses > 0 ? 100 : 0

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '16px',
      padding: '20px',
      border: `1px solid ${isPositive ? 'var(--border)' : '#fecaca'}`,
      boxShadow: '0 2px 12px var(--shadow)',
      flex: 1, minWidth: '200px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '12px',
      }}>
        <span style={{
          fontSize: '13px', fontWeight: '500',
          color: 'var(--text-muted)',
        }}>
          Income Left — {periodLabel}
        </span>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: isPositive ? '#f0fdf4' : '#fef2f2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {isPositive
            ? <TrendingUp size={20} color="#16a34a" />
            : <TrendingDown size={20} color="#dc2626" />
          }
        </div>
      </div>

      {/* Amount */}
      <div style={{
        fontSize: '24px', fontWeight: '700',
        color: isPositive ? 'var(--success)' : 'var(--danger)',
        marginBottom: '10px',
      }}>
        {isPositive ? '+' : '-'}{formatCurrency(Math.abs(left))}
      </div>

      {/* Progress Bar — expenses vs income */}
      <div style={{
        height: '6px', background: 'var(--border)',
        borderRadius: '999px', overflow: 'hidden',
        marginBottom: '8px',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.max(percentage, 2)}%`,
          background: percentage >= 100
            ? '#ef4444'
            : percentage >= 80
              ? '#f59e0b'
              : '#16a34a',
          borderRadius: '999px',
          transition: 'width 0.6s ease',
        }} />
      </div>

      {/* Labels */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: '12px', color: 'var(--text-muted)',
        }}>
          {percentage}% of income spent
        </span>
        {isPositive ? (
          <span style={{
            fontSize: '11px', fontWeight: '600',
            color: 'var(--success)',
            background: 'var(--success-light)',
            padding: '2px 8px', borderRadius: '999px',
          }}>
            ↗ Carries to next month
          </span>
        ) : (
          <span style={{
            fontSize: '11px', fontWeight: '600',
            color: 'var(--danger)',
            background: 'var(--danger-light)',
            padding: '2px 8px', borderRadius: '999px',
          }}>
            ↘ Over budget
          </span>
        )}
      </div>
    </div>
  )
}

// ── Custom Bar Tooltip ─────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '12px 16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}>
        <p style={{
          fontSize: '13px', fontWeight: '600',
          color: 'var(--text-primary)', marginBottom: '8px',
        }}>
          {label}
        </p>
        {payload.map((entry) => (
          <p key={entry.name} style={{
            fontSize: '13px', color: entry.color, margin: '4px 0',
          }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// ── Custom Pie Tooltip ─────────────────────────────────────────────────────
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0]
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '10px 14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}>
        <p style={{
          fontSize: '13px', fontWeight: '700',
          color: 'var(--text-primary)', margin: '0 0 4px',
        }}>
          {item.name}
        </p>
        <p style={{ fontSize: '13px', color: item.payload.fill, margin: 0 }}>
          {formatCurrency(item.value)}
        </p>
        <p style={{
          fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0',
        }}>
          {item.payload.percentage}% of expenses
        </p>
      </div>
    )
  }
  return null
}

// ── Custom Pie Label ───────────────────────────────────────────────────────
const renderCustomLabel = ({
  cx, cy, midAngle, innerRadius,
  outerRadius, percentage,
}) => {
  if (percentage < 5) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle"
          dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${percentage}%`}
    </text>
  )
}

// ── Greeting Helper ────────────────────────────────────────────────────────
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  return 'Evening'
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [activePeriod, setActivePeriod] = useState('all')

  const {
    transactions, summary,
    loading, summaryLoading,
    fetchTransactions, fetchSummary,
  } = useTransactions()

  // ── Handle Period Change ───────────────────────────────────────────────
  const handlePeriodChange = useCallback((preset) => {
    setActivePeriod(preset)
    if (preset === 'all') {
      fetchTransactions({ limit: 100 })
      fetchSummary({})
      return
    }
    const { startDate, endDate } = getDatePreset(preset)
    fetchTransactions({ startDate, endDate, limit: 100 })
    fetchSummary({ startDate, endDate })
  }, [fetchTransactions, fetchSummary])

  // ── Bar Chart Data ─────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (!transactions.length) return []
    const monthMap = {}
    transactions.forEach((t) => {
      const date = new Date(t.date)
      const key  = date.toLocaleDateString('en-IN', {
        month: 'short', year: '2-digit',
      })
      if (!monthMap[key]) {
        monthMap[key] = { month: key, Income: 0, Expenses: 0 }
      }
      if (t.type === 'income') {
        monthMap[key].Income   += parseFloat(t.amount)
      } else {
        monthMap[key].Expenses += parseFloat(t.amount)
      }
    })
    return Object.values(monthMap).slice(-6)
  }, [transactions])

  // ── Pie Chart Data ─────────────────────────────────────────────────────
  const pieData = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense')
    if (!expenses.length) return []
    const categoryMap = {}
    expenses.forEach((t) => {
      const cat = t.category
        ? t.category.charAt(0).toUpperCase() +
          t.category.slice(1).toLowerCase()
        : 'Uncategorized'
      if (!categoryMap[cat]) categoryMap[cat] = 0
      categoryMap[cat] += parseFloat(t.amount)
    })
    const total = Object.values(categoryMap)
      .reduce((sum, val) => sum + val, 0)
    return Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / total) * 100),
      }))
  }, [transactions])

  const recentTransactions = transactions.slice(0, 5)

  // ── Active Period Label ────────────────────────────────────────────────
  const activePeriodLabel = DATE_PRESETS.find(
    (p) => p.value === activePeriod
  )?.label || 'All Time'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Welcome Banner ─────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        borderRadius: '16px', padding: '24px 28px',
        color: 'white', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
            Good {getGreeting()}, {user?.fullName?.split(' ')[0]}! 👋
          </h2>
          <p style={{ fontSize: '14px', opacity: 0.85, marginTop: '4px' }}>
            Here's your financial overview for today.
          </p>
        </div>
        <button
          onClick={() => navigate('/transactions',
            { state: { openModal: true } })}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '10px', padding: '10px 16px',
            color: 'white', cursor: 'pointer',
            fontSize: '14px', fontWeight: '600',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Plus size={16} />
          Add Transaction
        </button>
      </div>

      {/* ── Date Filter Bar ────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: '14px',
        padding: '14px 20px', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        gap: '10px', flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '8px', marginRight: '4px',
        }}>
          <Calendar size={16} color="var(--text-muted)" />
          <span style={{
            fontSize: '13px', fontWeight: '600', color: '#6b7280',
          }}>
            Period:
          </span>
        </div>

        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePeriodChange(preset.value)}
            style={{
              padding: '7px 16px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              border: '1px solid',
              borderColor: activePeriod === preset.value
                ? '#2563eb' : '#e5e7eb',
              background: activePeriod === preset.value
                ? '#2563eb' : '#ffffff',
              color: activePeriod === preset.value
                ? '#ffffff' : '#6b7280',
              transition: 'all 0.15s ease',
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────────── */}
      {summaryLoading ? (
        <div style={{
          display: 'flex', justifyContent: 'center', padding: '40px',
        }}>
          <Spinner size="lg" />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <SummaryCard
            title={`Balance — ${activePeriodLabel}`}
            amount={summary?.balance}
            bgColor="#eff6ff"
            icon={<Wallet size={20} color="#2563eb" />}
          />
          <SummaryCard
            title={`Income — ${activePeriodLabel}`}
            amount={summary?.totalIncome}
            bgColor="#f0fdf4"
            trend="up"
            icon={<TrendingUp size={20} color="#16a34a" />}
          />
          <SummaryCard
            title={`Expenses — ${activePeriodLabel}`}
            amount={summary?.totalExpenses}
            bgColor="#fef2f2"
            trend="down"
            icon={<TrendingDown size={20} color="#dc2626" />}
          />
          <IncomeLeftCard
            summary={summary}
            periodLabel={activePeriodLabel}
          />
        </div>
      )}

      {/* ── Bar Chart + Recent Transactions ────────────────────────────── */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

        {/* Bar Chart */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: '16px',
          padding: '24px', border: '1px solid var(--border)',
          boxShadow: '0 2px 12px var(--shadow)',
          flex: 2, minWidth: '300px',
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '16px', fontWeight: '700',
              color: 'var(--text-primary)', margin: 0,
            }}>
              Income vs Expenses
            </h3>
            <p style={{
              fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px',
            }}>
              {activePeriodLabel} — monthly breakdown
            </p>
          </div>

          {loading ? (
            <div style={{
              display: 'flex', justifyContent: 'center', padding: '40px',
            }}>
              <Spinner />
            </div>
          ) : chartData.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px', color: 'var(--text-muted)',
            }}>
              <ArrowLeftRight size={40} style={{
                margin: '0 auto 12px', opacity: 0.3, display: 'block',
              }} />
              <p style={{ fontSize: '14px' }}>
                No data for this period.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3"
                               stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month"
                       tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                       axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                       axisLine={false} tickLine={false}
                       tickFormatter={(v) =>
                         `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{
                  fontSize: '13px', paddingTop: '16px',
                }} />
                <Bar dataKey="Income"   fill="#2563eb"
                     radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ef4444"
                     radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Transactions */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: '16px',
          padding: '24px', border: '1px solid var(--border)',
          boxShadow: '0 2px 12px var(--shadow)',
          flex: 1, minWidth: '280px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: '20px',
          }}>
            <div>
              <h3 style={{
                fontSize: '16px', fontWeight: '700',
                color: 'var(--text-primary)', margin: 0,
              }}>
                Recent Transactions
              </h3>
              <p style={{
                fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px',
              }}>
                {activePeriodLabel}
              </p>
            </div>
            <button
              onClick={() => navigate('/transactions')}
              style={{
                fontSize: '13px', color: '#2563eb',
                background: 'none', border: 'none',
                cursor: 'pointer', fontWeight: '500',
              }}
            >
              View all
            </button>
          </div>

          {loading ? (
            <div style={{
              display: 'flex', justifyContent: 'center', padding: '40px',
            }}>
              <Spinner />
            </div>
          ) : recentTransactions.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px', color: '#9ca3af',
            }}>
              <p style={{ fontSize: '14px' }}>
                No transactions for this period.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              {recentTransactions.map((t) => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px', background: 'var(--bg-muted)',
                  borderRadius: '10px',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                  }}>
                    <div style={{
                      width: '36px', height: '36px',
                      borderRadius: '10px', flexShrink: 0,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      background: t.type === 'income'
                        ? '#f0fdf4' : '#fef2f2',
                    }}>
                      {t.type === 'income'
                        ? <TrendingUp size={16} color="#16a34a" />
                        : <TrendingDown size={16} color="#dc2626" />
                      }
                    </div>
                    <div>
                      <p style={{
                        fontSize: '13px', fontWeight: '600',
                        color: 'var(--text-primary)', margin: 0,
                        maxWidth: '140px', whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {t.description}
                      </p>
                      <p style={{
                        fontSize: '11px', color: 'var(--text-muted)',
                        margin: 0, marginTop: '2px',
                      }}>
                        {formatDate(t.date)}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '14px', fontWeight: '700',
                    color: t.type === 'income' ? '#16a34a' : '#dc2626',
                  }}>
                    {t.type === 'income' ? '+' : '-'}
                    {formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Expense Breakdown by Category ──────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: '16px',
        padding: '24px', border: '1px solid var(--border)',
        boxShadow: '0 2px 12px var(--shadow)',
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '16px', fontWeight: '700',
            color: 'var(--text-primary)', margin: 0,
          }}>
            Expense Breakdown
          </h3>
          <p style={{
            fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px',
          }}>
            {activePeriodLabel} — spending by category
          </p>
        </div>

        {loading ? (
          <div style={{
            display: 'flex', justifyContent: 'center', padding: '40px',
          }}>
            <Spinner />
          </div>
        ) : pieData.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px', color: '#9ca3af',
          }}>
            <TrendingDown size={40} style={{
              margin: '0 auto 12px', opacity: 0.3, display: 'block',
            }} />
            <p style={{ fontSize: '14px' }}>
              No expense data for this period.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex', gap: '40px',
            alignItems: 'center', flexWrap: 'wrap',
          }}>
            {/* Pie Chart */}
            <div style={{ flexShrink: 0 }}>
              <ResponsiveContainer width={280} height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Summary Table */}
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{
                padding: '14px 16px',
                background: 'var(--danger-light)',
                borderRadius: '12px', marginBottom: '16px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{
                  fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)',
                }}>
                  Total Expenses — {activePeriodLabel}
                </span>
                <span style={{
                  fontSize: '16px', fontWeight: '800', color: '#dc2626',
                }}>
                  {formatCurrency(
                    pieData.reduce((sum, d) => sum + d.value, 0)
                  )}
                </span>
              </div>

              <div style={{
                display: 'flex', flexDirection: 'column', gap: '10px',
              }}>
                {pieData.map((item, index) => (
                  <div key={item.name} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                  }}>
                    <div style={{
                      width: '12px', height: '12px', borderRadius: '50%',
                      background: PIE_COLORS[index % PIE_COLORS.length],
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}>
                        <span style={{
                          fontSize: '13px', fontWeight: '600',
                          color: 'var(--text-primary)',
                        }}>
                          {item.name}
                        </span>
                        <span style={{
                          fontSize: '13px', fontWeight: '700',
                          color: 'var(--text-primary)',
                        }}>
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                      <div style={{
                        height: '6px', background: 'var(--border)',
                        borderRadius: '999px', overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${item.percentage}%`,
                          background: PIE_COLORS[index % PIE_COLORS.length],
                          borderRadius: '999px',
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                    </div>
                    <span style={{
                      fontSize: '12px', fontWeight: '700',
                      color: 'var(--text-muted)', minWidth: '36px',
                      textAlign: 'right',
                    }}>
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default Dashboard