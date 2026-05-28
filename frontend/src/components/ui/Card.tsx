import { cn } from '../../lib/utils'
import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
  action?: ReactNode
}

export default function Card({ title, children, className, action }: CardProps) {
  return (
    <div className={cn(
      'bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-green-100/80 dark:border-gray-700/60 p-5',
      className,
    )}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm tracking-tight">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
