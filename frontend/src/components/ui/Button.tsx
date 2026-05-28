import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const variants = {
  // Soft green — light base, lighter on hover
  primary: [
    'bg-green-100 text-green-700 hover:bg-green-50 active:bg-green-200',
    'dark:bg-green-500/20 dark:text-green-300 dark:hover:bg-green-500/10 dark:active:bg-green-500/30',
    'border border-green-200 dark:border-green-500/30',
    'focus:ring-green-400',
  ].join(' '),

  // Neutral soft — light gray base, lighter on hover
  secondary: [
    'bg-gray-100 text-gray-600 hover:bg-gray-50 active:bg-gray-200',
    'dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/60 dark:active:bg-gray-800',
    'border border-gray-200 dark:border-gray-700',
    'focus:ring-gray-300',
  ].join(' '),

  // Soft red
  danger: [
    'bg-red-50 text-red-600 hover:bg-red-100/50 active:bg-red-100',
    'dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/10 dark:active:bg-red-500/25',
    'border border-red-200 dark:border-red-500/30',
    'focus:ring-red-400',
  ].join(' '),

  // Ghost — no bg, subtle hover
  ghost: [
    'bg-transparent text-gray-500 hover:bg-gray-100/80 hover:text-gray-700 active:bg-gray-200',
    'dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-200',
    'focus:ring-gray-300',
  ].join(' '),
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-900',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  )
}
