// src/pages/Dashboard.jsx
// eslint-disable-next-line no-unused-vars
import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Wallet,
  ArrowUpRight, ArrowDownRight, Plus,
  ArrowLeftRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
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

// ── Summary Card Component ─────────────────────────────────────────────────
const SummaryCard = ({ title, amount, icon, bgColor, trend }) => (
  <div style={{
    background: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #f3f4f6',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    flex: 1,
    minWidth: '200px',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: '12px',
    }}>
      <span style={{
        fontSize: '13px', fontWeight: '500', color: '#6b7280',
      }}>
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
    <div style={{
      fontSize: '24px', fontWeight: '700', color: '#111827',
    }}>
      {formatCurrency(amount || 0)}
    </div>
    {trend && (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        marginTop: '6px',
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

// ── Custom Bar Chart Tooltip ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#ffffff', border: '1px solid #f3f4f6',
        borderRadius: '10px', padding: '12px 16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}>
        <p style={{
          fontSize: '13px', fontWeight: '600',
          color: '#111827', marginBottom: '8px',
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
        background: '#ffffff', border: '1px solid #f3f4f6',
        borderRadius: '10px', padding: '10px 14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}>
        <p style={{
          fontSize: '13px', fontWeight: '700',
          color: '#111827', margin: '0 0 4px',
        }}>
          {item.name}
        </p>
        <p style={{
          fontSize: '13px', color: item.payload.fill,
          margin: 0,
        }}>
          {formatCurrency(item.value)}
        </p>
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>
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
    <text
      x={x} y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {`${percentage}%`}
    </text>
  )
}

// ── Helper: Time-based greeting ────────────────────────────────────────────
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  return 'Evening'
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user }                   = useAuth()
  const { transactions, summary,
          loading, summaryLoading } = useTransactions()

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
        monthMap[key].Income += parseFloat(t.amount)
      } else {
        monthMap[key].Expenses += parseFloat(t.amount)
      }
    })
    return Object.values(monthMap).slice(-6)
  }, [transactions])

  // ── Pie Chart Data — Expenses by Category ─────────────────────────────
  const pieData = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense')
    if (!expenses.length) return []

    const categoryMap = {}
    expenses.forEach((t) => {
      const cat = t.category
       ? t.category.charAt(0).toUpperCase() + t.category.slice(1).toLowerCase()
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

  // Recent transactions — last 5
  const recentTransactions = transactions.slice(0, 5)

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
        <Link
          to="/transactions"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '10px', padding: '10px 16px',
            color: 'white', textDecoration: 'none',
            fontSize: '14px', fontWeight: '600',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Plus size={16} />
          Add Transaction
        </Link>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────────── */}
      {summaryLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center',
                      padding: '40px' }}>
          <Spinner size="lg" />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <SummaryCard
            title="Total Balance"
            amount={summary?.balance}
            bgColor="#eff6ff"
            icon={<Wallet size={20} color="#2563eb" />}
          />
          <SummaryCard
            title="Total Income"
            amount={summary?.totalIncome}
            bgColor="#f0fdf4"
            trend="up"
            icon={<TrendingUp size={20} color="#16a34a" />}
          />
          <SummaryCard
            title="Total Expenses"
            amount={summary?.totalExpenses}
            bgColor="#fef2f2"
            trend="down"
            icon={<TrendingDown size={20} color="#dc2626" />}
          />
        </div>
      )}

      {/* ── Bar Chart + Recent Transactions ────────────────────────────── */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

        {/* Bar Chart */}
        <div style={{
          background: '#ffffff', borderRadius: '16px',
          padding: '24px', border: '1px solid #f3f4f6',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          flex: 2, minWidth: '300px',
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '16px', fontWeight: '700',
              color: '#111827', margin: 0,
            }}>
              Income vs Expenses
            </h3>
            <p style={{
              fontSize: '13px', color: '#9ca3af', marginTop: '2px',
            }}>
              Monthly breakdown
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center',
                          padding: '40px' }}>
              <Spinner />
            </div>
          ) : chartData.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px', color: '#9ca3af',
            }}>
              <ArrowLeftRight size={40} style={{
                margin: '0 auto 12px', opacity: 0.3, display: 'block',
              }} />
              <p style={{ fontSize: '14px' }}>No transaction data yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3"
                               stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month"
                       tick={{ fontSize: 12, fill: '#9ca3af' }}
                       axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }}
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
          background: '#ffffff', borderRadius: '16px',
          padding: '24px', border: '1px solid #f3f4f6',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          flex: 1, minWidth: '280px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: '20px',
          }}>
            <div>
              <h3 style={{
                fontSize: '16px', fontWeight: '700',
                color: '#111827', margin: 0,
              }}>
                Recent Transactions
              </h3>
              <p style={{
                fontSize: '13px', color: '#9ca3af', marginTop: '2px',
              }}>
                Last 5 transactions
              </p>
            </div>
            <Link to="/transactions" style={{
              fontSize: '13px', color: '#2563eb',
              textDecoration: 'none', fontWeight: '500',
            }}>
              View all
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center',
                          padding: '40px' }}>
              <Spinner />
            </div>
          ) : recentTransactions.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px', color: '#9ca3af',
            }}>
              <p style={{ fontSize: '14px' }}>No transactions yet.</p>
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              {recentTransactions.map((t) => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px', background: '#f9fafb',
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
                        color: '#111827', margin: 0,
                        maxWidth: '140px', whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {t.description}
                      </p>
                      <p style={{
                        fontSize: '11px', color: '#9ca3af',
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
        background: '#ffffff', borderRadius: '16px',
        padding: '24px', border: '1px solid #f3f4f6',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '16px', fontWeight: '700',
            color: '#111827', margin: 0,
          }}>
            Expense Breakdown
          </h3>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '2px' }}>
            Spending distribution by category
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center',
                        padding: '40px' }}>
            <Spinner />
          </div>
        ) : pieData.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px', color: '#9ca3af',
          }}>
            <TrendingDown size={40} style={{
              margin: '0 auto 12px', opacity: 0.3, display: 'block',
            }} />
            <p style={{ fontSize: '14px' }}>No expense data yet.</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              Add some expenses to see the breakdown.
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

              {/* Total */}
              <div style={{
                padding: '14px 16px',
                background: '#fef2f2',
                borderRadius: '12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{
                  fontSize: '13px', fontWeight: '600', color: '#6b7280',
                }}>
                  Total Expenses
                </span>
                <span style={{
                  fontSize: '16px', fontWeight: '800', color: '#dc2626',
                }}>
                  {formatCurrency(
                    pieData.reduce((sum, d) => sum + d.value, 0)
                  )}
                </span>
              </div>

              {/* Category Rows */}
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '10px',
              }}>
                {pieData.map((item, index) => (
                  <div key={item.name} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                  }}>
                    {/* Color dot */}
                    <div style={{
                      width: '12px', height: '12px', borderRadius: '50%',
                      background: PIE_COLORS[index % PIE_COLORS.length],
                      flexShrink: 0,
                    }} />

                    {/* Category name + progress bar */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}>
                        <span style={{
                          fontSize: '13px', fontWeight: '600',
                          color: '#111827',
                        }}>
                          {item.name}
                        </span>
                        <span style={{
                          fontSize: '13px', fontWeight: '700',
                          color: '#374151',
                        }}>
                          {formatCurrency(item.value)}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div style={{
                        height: '6px', background: '#f3f4f6',
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

                    {/* Percentage */}
                    <span style={{
                      fontSize: '12px', fontWeight: '700',
                      color: '#9ca3af', minWidth: '36px',
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