// src/components/common/Button.jsx
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
}) => {

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    outline: 'none',
    transition: 'background 0.15s ease',
    width: fullWidth ? '100%' : 'auto',
  }

  const variantStyles = {
    primary: {
      background: '#2563eb',
      color: '#ffffff',
    },
    secondary: {
      background: '#ffffff',
      color: '#374151',
      border: '1px solid #d1d5db',
    },
    danger: {
      background: '#dc2626',
      color: '#ffffff',
    },
    ghost: {
      background: 'transparent',
      color: '#6b7280',
    },
    success: {
      background: '#16a34a',
      color: '#ffffff',
    },
  }

  const sizeStyles = {
    sm: { padding: '6px 20px',  fontSize: '13px' },
    md: { padding: '10px 24px', fontSize: '14px' },
    lg: { padding: '12px 32px', fontSize: '15px' },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...sizeStyles[size],
      }}
    >
      {loading && (
        <svg
          style={{ animation: 'spin 1s linear infinite',
                   height: '16px', width: '16px' }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            style={{ opacity: 0.25 }}
            cx="12" cy="12" r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            style={{ opacity: 0.75 }}
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}

export default Button