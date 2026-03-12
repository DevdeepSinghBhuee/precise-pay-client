// src/pages/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, Lock, TrendingUp } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { loginSchema } from '../utils/validators'
import toast from 'react-hot-toast'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed.'
      toast.error(message)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #eef2ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>

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
          <h1 style={{ fontSize: '28px', fontWeight: '800',
                       color: '#111827', margin: 0 }}>
            Precise-Pay
          </h1>
          <p style={{ color: '#6b7280', marginTop: '6px', fontSize: '14px' }}>
            Your personal finance companion
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          border: '1px solid #f3f4f6',
        }}>

          {/* Card Header */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700',
                         color: '#111827', margin: 0 }}>
              Welcome back
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px',
                        marginTop: '6px' }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              register={register('email')}
              error={errors.email?.message}
              leftIcon={<Mail size={16} />}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              register={register('password')}
              error={errors.password?.message}
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ color: '#9ca3af', cursor: 'pointer',
                           background: 'none', border: 'none',
                           display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div style={{ marginTop: '4px' }}>
              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                size="lg"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center',
            margin: '24px 0', gap: '12px',
          }}>
            <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>
              Don't have an account?
            </span>
            <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
          </div>

          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" fullWidth>
              Create Account
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center', fontSize: '12px',
          color: '#9ca3af', marginTop: '24px',
        }}>
          Protected by bank-grade encryption 🔒
        </p>

      </div>
    </div>
  )
}

export default Login