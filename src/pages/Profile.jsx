// src/pages/Profile.jsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User, Mail, Calendar, Wallet,
  Lock, Eye, EyeOff, Shield,
  TrendingUp, TrendingDown,
  CheckCircle,
} from 'lucide-react'
import useAuth from '../hooks/useAuth'
import useTransactions from '../hooks/useTransactions'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { formatCurrency, formatDate } from '../utils/formatters'
import toast from 'react-hot-toast'
import api from '../api/axios'

// ── Password Change Schema ─────────────────────────────────────────────────
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Must contain uppercase, lowercase, number and special character.'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password.'),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  { message: 'Passwords do not match.', path: ['confirmPassword'] }
)

// ── Info Row Component ─────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, badge }) => (
  <div style={{
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 0',
    borderBottom: '1px solid #f3f4f6',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: '#f3f4f6', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        color: '#6b7280', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{
          fontSize: '12px', color: '#9ca3af',
          margin: 0, fontWeight: '500',
        }}>
          {label}
        </p>
        <p style={{
          fontSize: '14px', color: '#111827',
          margin: 0, fontWeight: '600', marginTop: '2px',
        }}>
          {value}
        </p>
      </div>
    </div>
    {badge}
  </div>
)

// ── Main Profile Page ──────────────────────────────────────────────────────
const Profile = () => {
  const { user }                          = useAuth()
  const { summary, summaryLoading }       = useTransactions()
  const [showCurrent, setShowCurrent]     = useState(false)
  const [showNew, setShowNew]             = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(passwordSchema) })

  // ── Handle Password Change ─────────────────────────────────────────────
  const onPasswordChange = async (data) => {
    setIsChangingPassword(true)
    try {
      await api.patch('/auth/profile/password', {
        currentPassword: data.currentPassword,
        newPassword:     data.newPassword,
      })
      toast.success('Password changed successfully!')
      reset()
    } catch (error) {
      const message = error.response?.data?.message
        || 'Failed to change password.'
      toast.error(message)
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      gap: '24px',
    }}>

      {/* ── Profile Header Card ───────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        borderRadius: '20px', padding: '32px',
        color: 'white', display: 'flex',
        alignItems: 'center', gap: '24px',
        flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{
          width: '80px', height: '80px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', fontWeight: '800',
          border: '3px solid rgba(255,255,255,0.4)',
          flexShrink: 0,
        }}>
          {user?.fullName?.charAt(0).toUpperCase()}
        </div>

        {/* User Info */}
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: '24px', fontWeight: '800',
            margin: 0, marginBottom: '4px',
          }}>
            {user?.fullName}
          </h2>
          <p style={{ opacity: 0.85, fontSize: '14px', margin: 0 }}>
            {user?.email}
          </p>
          {user?.lastLoginAt && (
            <p style={{
              opacity: 0.7, fontSize: '12px',
              margin: 0, marginTop: '6px',
            }}>
              Last login: {formatDate(user.lastLoginAt)}
            </p>
          )}
        </div>

        {/* Balance Badge */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '14px', padding: '16px 20px',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.2)',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '12px', opacity: 0.8,
            margin: 0, marginBottom: '4px',
            fontWeight: '500',
          }}>
            Current Balance
          </p>
          <p style={{
            fontSize: '22px', fontWeight: '800',
            margin: 0,
          }}>
            {formatCurrency(user?.balance || 0)}
          </p>
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────────── */}
      {!summaryLoading && summary && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>

          {/* Income Stat */}
          <div style={{
            flex: 1, minWidth: '160px',
            background: '#ffffff', borderRadius: '14px',
            padding: '18px 20px', border: '1px solid #f3f4f6',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: '#f0fdf4', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <TrendingUp size={20} color="#16a34a" />
            </div>
            <div>
              <p style={{
                fontSize: '12px', color: '#9ca3af',
                margin: 0, fontWeight: '500',
              }}>
                Total Income
              </p>
              <p style={{
                fontSize: '18px', fontWeight: '700',
                color: '#16a34a', margin: 0,
              }}>
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>
          </div>

          {/* Expense Stat */}
          <div style={{
            flex: 1, minWidth: '160px',
            background: '#ffffff', borderRadius: '14px',
            padding: '18px 20px', border: '1px solid #f3f4f6',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: '#fef2f2', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <TrendingDown size={20} color="#dc2626" />
            </div>
            <div>
              <p style={{
                fontSize: '12px', color: '#9ca3af',
                margin: 0, fontWeight: '500',
              }}>
                Total Expenses
              </p>
              <p style={{
                fontSize: '18px', fontWeight: '700',
                color: '#dc2626', margin: 0,
              }}>
                {formatCurrency(summary.totalExpenses)}
              </p>
            </div>
          </div>

          {/* Net Savings Stat */}
          <div style={{
            flex: 1, minWidth: '160px',
            background: '#ffffff', borderRadius: '14px',
            padding: '18px 20px', border: '1px solid #f3f4f6',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: '#eff6ff', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Wallet size={20} color="#2563eb" />
            </div>
            <div>
              <p style={{
                fontSize: '12px', color: '#9ca3af',
                margin: 0, fontWeight: '500',
              }}>
                Net Savings
              </p>
              <p style={{
                fontSize: '18px', fontWeight: '700',
                color: parseFloat(summary.balance) >= 0
                  ? '#2563eb' : '#dc2626',
                margin: 0,
              }}>
                {formatCurrency(summary.balance)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Account Information ───────────────────────────────────────── */}
      <div style={{
        background: '#ffffff', borderRadius: '16px',
        padding: '24px', border: '1px solid #f3f4f6',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        <div style={{ marginBottom: '4px' }}>
          <h3 style={{
            fontSize: '16px', fontWeight: '700',
            color: '#111827', margin: 0,
          }}>
            Account Information
          </h3>
          <p style={{
            fontSize: '13px', color: '#9ca3af', marginTop: '4px',
          }}>
            Your personal account details
          </p>
        </div>

        <InfoRow
          icon={<User size={16} />}
          label="Full Name"
          value={user?.fullName}
        />
        <InfoRow
          icon={<Mail size={16} />}
          label="Email Address"
          value={user?.email}
          badge={
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '4px 10px', borderRadius: '999px',
              fontSize: '11px', fontWeight: '600',
              background: '#f0fdf4', color: '#16a34a',
            }}>
              <CheckCircle size={12} />
              Verified
            </span>
          }
        />
        <InfoRow
          icon={<Calendar size={16} />}
          label="Member Since"
          value={user?.createdAt
            ? formatDate(user.createdAt)
            : 'N/A'
          }
        />
        <InfoRow
          icon={<Shield size={16} />}
          label="Account Status"
          value="Active"
          badge={
            <span style={{
              padding: '4px 10px', borderRadius: '999px',
              fontSize: '11px', fontWeight: '600',
              background: '#eff6ff', color: '#2563eb',
            }}>
              Premium
            </span>
          }
        />
      </div>

      {/* ── Change Password ───────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff', borderRadius: '16px',
        padding: '24px', border: '1px solid #f3f4f6',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{
            fontSize: '16px', fontWeight: '700',
            color: '#111827', margin: 0,
          }}>
            Change Password
          </h3>
          <p style={{
            fontSize: '13px', color: '#9ca3af', marginTop: '4px',
          }}>
            Update your password to keep your account secure
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onPasswordChange)}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <Input
            label="Current Password"
            type={showCurrent ? 'text' : 'password'}
            placeholder="Enter current password"
            register={register('currentPassword')}
            error={errors.currentPassword?.message}
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                style={{
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: '#9ca3af',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <Input
            label="New Password"
            type={showNew ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            register={register('newPassword')}
            error={errors.newPassword?.message}
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: '#9ca3af',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <Input
            label="Confirm New Password"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat new password"
            register={register('confirmPassword')}
            error={errors.confirmPassword?.message}
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: '#9ca3af',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          {/* Security tip */}
          <div style={{
            background: '#fffbeb', borderRadius: '10px',
            padding: '12px 16px', border: '1px solid #fcd34d',
            display: 'flex', gap: '10px', alignItems: 'flex-start',
          }}>
            <Shield size={16} color="#d97706"
                    style={{ flexShrink: 0, marginTop: '1px' }} />
            <p style={{
              fontSize: '13px', color: '#92400e', margin: 0,
            }}>
              Use a strong password with uppercase, lowercase,
              numbers and special characters.
            </p>
          </div>

          <div style={{ paddingTop: '12px' }}>
            <Button
              type="submit"
              loading={isSubmitting || isChangingPassword}
              size="lg"
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>

    </div>
  )
}

export default Profile