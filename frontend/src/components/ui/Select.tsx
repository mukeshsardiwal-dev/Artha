import { cn } from '../../lib/utils'
import type { SelectHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string | number; label: string }>
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, placeholder, className, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        {...props}
        className={cn(
          'w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all duration-150',
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
          'border-gray-200 dark:border-gray-700',
          'focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:focus:border-green-400 dark:focus:ring-green-400/20',
          'hover:border-gray-300 dark:hover:border-gray-600',
          error && 'border-red-400',
          className,
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
})

Select.displayName = 'Select'
export default Select
