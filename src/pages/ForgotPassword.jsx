// src/pages/ForgotPassword.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, TrendingUp, ArrowLeft, CheckCircle } from 'lucide-react'
import Button from '../components/common/Button'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_BASE_URL

const ForgotPassword = () => {
  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Please enter your email address.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      const data = await response.json()
      if (response.ok) {
        setSubmitted(true)
      } else {
        toast.error(data?.message || 'Something went wrong.')
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
      background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #eef2ff 100%)',
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
          background: '#ffffff', borderRadius: '20px',
          padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          border: '1px solid #f3f4f6',
        }}>

          {!submitted ? (
            <>
              {/* Header */}
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{
                  fontSize: '22px', fontWeight: '700',
                  color: '#111827', margin: 0,
                }}>
                  Forgot your password?
                </h2>
                <p style={{
                  color: '#6b7280', fontSize: '14px', marginTop: '8px',
                }}>
                  Enter your email and we'll send you a link to reset it.
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '20px',
                }}
              >
                {/* Email Input */}
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '6px',
                }}>
                  <label style={{
                    fontSize: '14px', fontWeight: '500', color: '#374151',
                  }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{
                      position: 'absolute', left: '14px',
                      top: '50%', transform: 'translateY(-50%)',
                      color: '#9ca3af', pointerEvents: 'none',
                    }} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%', paddingLeft: '42px',
                        paddingRight: '14px', paddingTop: '11px',
                        paddingBottom: '11px',
                        border: '1px solid #d1d5db', borderRadius: '8px',
                        fontSize: '14px', color: '#111827',
                        outline: 'none', boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6'
                        e.target.style.boxShadow =
                          '0 0 0 3px rgba(59,130,246,0.15)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>

                <Button type="submit" fullWidth loading={loading} size="lg">
                  {loading ? 'Sending...' : 'Send Reset Link'}
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
                Check your inbox!
              </h3>
              <p style={{
                fontSize: '14px', color: '#6b7280',
                lineHeight: '1.6', margin: '0 0 24px',
              }}>
                If an account exists for <strong>{email}</strong>,
                you'll receive a password reset link shortly.
                Check your spam folder if you don't see it.
              </p>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setSubmitted(false)}
              >
                Try a different email
              </Button>
            </div>
          )}

          {/* Back to Login */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '14px', color: '#2563eb',
                textDecoration: 'none', fontWeight: '500',
              }}
            >
              <ArrowLeft size={14} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword