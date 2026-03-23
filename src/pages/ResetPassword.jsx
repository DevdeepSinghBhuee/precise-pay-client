// src/pages/ResetPassword.jsx
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Lock, TrendingUp, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { z } from 'zod'
import Button from '../components/common/Button'
import toast from 'react-hot-toast'

// ── Password Schema ────────────────────────────────────────────────────────
const passwordSchema = z.object({
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

const API_URL = import.meta.env.VITE_API_BASE_URL

const ResetPassword = () => {
  const { token }                   = useParams()
  const navigate                    = useNavigate()
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew]                 = useState(false)
  const [showConfirm, setShowConfirm]         = useState(false)
  const [loading, setLoading]                 = useState(false)
  const [success, setSuccess]                 = useState(false)
  const [errors, setErrors]                   = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    // ── Validate ─────────────────────────────────────────────────────
    const result = passwordSchema.safeParse({ newPassword, confirmPassword })
    if (!result.success) {
      const fieldErrors = {}
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `${API_URL}/auth/reset-password/${token}`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ newPassword }),
        }
      )
      const data = await response.json()
      if (response.ok) {
        setSuccess(true)
        setTimeout(() => navigate('/login', { replace: true }), 3000)
      } else {
        toast.error(data?.message || 'Reset link is invalid or expired.')
      }
    } catch {
      toast.error('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', width: '64px', height: '64px',
            background: '#2563eb', borderRadius: '16px',
            marginBottom: '16px',
            boxShadow: '0 10px 25px rgba(37,99,235,0.3)',
          }}>
            <TrendingUp color="white" size={32} />
          </div>
          <h1 style={{
            fontSize: '28px', fontWeight: '800',
            color: '#111827', margin: 0,
          }}>
            Precise-Pay
          </h1>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: '20px',
          padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          border: '1px solid var(--border)',
        }}>

          {!success ? (
            <>
              {/* Header */}
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{
                  fontSize: '22px', fontWeight: '700',
                  color: 'var(--text-primary)', margin: 0,
                }}>
                  Set new password
                </h2>
                <p style={{
                  color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px',
                }}>
                  Choose a strong password for your account.
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '20px',
                }}
              >
                {/* New Password */}
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '6px',
                }}>
                  <label style={{
                    fontSize: '14px', fontWeight: '500', color: '#374151',
                  }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{
                      position: 'absolute', left: '14px',
                      top: '50%', transform: 'translateY(-50%)',
                      color: '#9ca3af', pointerEvents: 'none',
                    }} />
                    <input
                      type={showNew ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{
                        width: '100%', paddingLeft: '42px',
                        paddingRight: '42px', paddingTop: '11px',
                        paddingBottom: '11px',
                        border: `1px solid ${errors.newPassword
                          ? '#ef4444' : '#d1d5db'}`,
                        borderRadius: '8px', fontSize: '14px',
                        color: '#111827', outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        if (!errors.newPassword) {
                          e.target.style.borderColor = '#3b82f6'
                          e.target.style.boxShadow =
                            '0 0 0 3px rgba(59,130,246,0.15)'
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.newPassword) {
                          e.target.style.borderColor = '#d1d5db'
                          e.target.style.boxShadow = 'none'
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      style={{
                        position: 'absolute', right: '12px',
                        top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none',
                        cursor: 'pointer', color: '#9ca3af',
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p style={{
                      fontSize: '12px', color: '#ef4444', margin: 0,
                    }}>
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '6px',
                }}>
                  <label style={{
                    fontSize: '14px', fontWeight: '500', color: '#374151',
                  }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{
                      position: 'absolute', left: '14px',
                      top: '50%', transform: 'translateY(-50%)',
                      color: '#9ca3af', pointerEvents: 'none',
                    }} />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        width: '100%', paddingLeft: '42px',
                        paddingRight: '42px', paddingTop: '11px',
                        paddingBottom: '11px',
                        border: `1px solid ${errors.confirmPassword
                          ? '#ef4444' : '#d1d5db'}`,
                        borderRadius: '8px', fontSize: '14px',
                        color: '#111827', outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        if (!errors.confirmPassword) {
                          e.target.style.borderColor = '#3b82f6'
                          e.target.style.boxShadow =
                            '0 0 0 3px rgba(59,130,246,0.15)'
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.confirmPassword) {
                          e.target.style.borderColor = '#d1d5db'
                          e.target.style.boxShadow = 'none'
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{
                        position: 'absolute', right: '12px',
                        top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none',
                        cursor: 'pointer', color: '#9ca3af',
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      {showConfirm
                        ? <EyeOff size={16} />
                        : <Eye size={16} />
                      }
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p style={{
                      fontSize: '12px', color: '#ef4444', margin: 0,
                    }}>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Password Requirements */}
                <div style={{
                  background: 'var(--bg-muted)', borderRadius: '10px',
                  padding: '12px 16px', border: '1px solid var(--border)',
                }}>
                  <p style={{
                    fontSize: '12px', color: 'var(--text-secondary)',
                    margin: 0, fontWeight: '500',
                  }}>
                    Password must contain:
                  </p>
                  {[
                    { rule: /.{8,}/, label: 'At least 8 characters' },
                    { rule: /[A-Z]/, label: 'One uppercase letter' },
                    { rule: /[a-z]/, label: 'One lowercase letter' },
                    { rule: /\d/,    label: 'One number' },
                    { rule: /[@$!%*?&]/, label: 'One special character (@$!%*?&)' },
                  ].map(({ rule, label }) => (
                    <div key={label} style={{
                      display: 'flex', alignItems: 'center',
                      gap: '6px', marginTop: '6px',
                    }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: rule.test(newPassword)
                          ? '#16a34a' : '#d1d5db',
                        flexShrink: 0,
                        transition: 'background 0.2s ease',
                      }} />
                      <span style={{
                        fontSize: '12px',
                        color: rule.test(newPassword)
                          ? '#16a34a' : '#9ca3af',
                        transition: 'color 0.2s ease',
                      }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  type="submit" fullWidth
                  loading={loading} size="lg"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            </>
          ) : (
            /* Success State */
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{
                width: '64px', height: '64px',
                background: '#f0fdf4', borderRadius: '50%',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 20px',
              }}>
                <CheckCircle size={32} color="#16a34a" />
              </div>
              <h3 style={{
                fontSize: '18px', fontWeight: '700',
                color: '#111827', margin: '0 0 8px',
              }}>
                Password reset successfully!
              </h3>
              <p style={{
                fontSize: '14px', color: '#6b7280',
                lineHeight: '1.6', margin: '0 0 8px',
              }}>
                Your password has been updated. Redirecting you to
                login in 3 seconds...
              </p>
            </div>
          )}

          {/* Back to Login */}
          {!success && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link
                to="/login"
                style={{
                  fontSize: '14px', color: '#2563eb',
                  textDecoration: 'none', fontWeight: '500',
                }}
              >
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword