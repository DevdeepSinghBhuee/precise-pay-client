// src/components/common/Input.jsx
const Input = ({
  label,
  type = 'text',
  placeholder = '',
  error = '',
  register = {},
  leftIcon = null,
  rightIcon = null,
  disabled = false,
  className = '',
  hint = '',
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>

      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Input Wrapper */}
      <div className="relative">

        {/* Left Icon */}
        {leftIcon && (
          <div
            style={{ position: 'absolute', left: '14px', top: '50%',
                     transform: 'translateY(-50%)', color: '#9ca3af',
                     pointerEvents: 'none', zIndex: 10 }}
          >
            {leftIcon}
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          {...register}
          style={{
            width: '100%',
            borderRadius: '8px',
            border: error ? '1px solid #f87171' : '1px solid #d1d5db',
            backgroundColor: error ? '#fef2f2' : '#ffffff',
            fontSize: '15px',
            color: '#111827',
            outline: 'none',
            paddingTop: '14px',
            paddingBottom: '14px',
            paddingLeft: leftIcon  ? '42px' : '14px',
            paddingRight: rightIcon ? '42px' : '14px',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? '#f87171' : '#3b82f6'
            e.target.style.boxShadow   = error
              ? '0 0 0 3px rgba(248,113,113,0.15)'
              : '0 0 0 3px rgba(59,130,246,0.15)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#f87171' : '#d1d5db'
            e.target.style.boxShadow   = 'none'
          }}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div
            style={{ position: 'absolute', right: '14px', top: '50%',
                     transform: 'translateY(-50%)', zIndex: 10 }}
          >
            {rightIcon}
          </div>
        )}
      </div>

      {/* Hint */}
      {hint && !error && (
        <p className="text-xs text-gray-400">{hint}</p>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor"
               viewBox="0 0 20 20">
            <path fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0
                 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0
                 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

export default Input