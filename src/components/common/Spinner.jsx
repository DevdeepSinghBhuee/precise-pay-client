// src/components/common/Spinner.jsx
const Spinner = ({ size = 'md', color = 'blue', className = '' }) => {

  const sizes = {
    sm:  'w-4 h-4 border-2',
    md:  'w-8 h-8 border-3',
    lg:  'w-12 h-12 border-4',
    xl:  'w-16 h-16 border-4',
  }

  const colors = {
    blue:  'border-blue-200 border-t-blue-600',
    white: 'border-white/30 border-t-white',
    gray:  'border-gray-200 border-t-gray-600',
    green: 'border-green-200 border-t-green-600',
  }

  return (
    <div
      className={`
        ${sizes[size]}
        ${colors[color]}
        rounded-full animate-spin
        ${className}
      `}
    />
  )
}

export default Spinner