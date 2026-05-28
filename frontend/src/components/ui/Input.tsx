import { cn } from '../../lib/utils'
import { type InputHTMLAttributes, forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
  showToggle?: boolean  // adds eye icon for password fields
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className, showToggle, type, ...props }, ref) => {
    const [visible, setVisible] = useState(false)

    const inputType = showToggle && type === 'password'
      ? (visible ? 'text' : 'password')
      : type

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            {...props}
            type={inputType}
            className={cn(
              'w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all duration-150',
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
              'border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500',
              'focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:focus:border-green-400 dark:focus:ring-green-400/20',
              'hover:border-gray-300 dark:hover:border-gray-600',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
              showToggle && 'pr-10',
              className,
            )}
          />
          {showToggle && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setVisible(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {visible
                ? <EyeOff className="w-4 h-4" />
                : <Eye className="w-4 h-4" />
              }
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {helpText && !error && <p className="text-xs text-gray-400">{helpText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
