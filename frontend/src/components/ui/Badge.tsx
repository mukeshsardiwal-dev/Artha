import { cn } from '../../lib/utils'
import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'
  children: ReactNode
  className?: string
}

const variants = {
  success: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-500/20',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-500/20',
  danger: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-500/20',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-500/20',
  default: 'bg-gray-100 text-gray-600 dark:bg-white/8 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-white/10',
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
      variants[variant],
      className,
    )}>
      {children}
    </span>
  )
}
