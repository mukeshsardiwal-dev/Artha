import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/sales': 'Sales',
  '/purchases': 'Purchases',
  '/parties': 'Parties',
  '/items': 'Items Master',
  '/cashbook': 'Cashbook',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? (pathname.startsWith('/parties/') ? 'Party Ledger' : 'Artha')

  return (
    <header className="sticky top-0 z-10 bg-white/90 dark:bg-[#0d1117] backdrop-blur-md border-b border-green-100/80 dark:border-white/5 px-5 py-3.5 flex items-center gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 dark:hover:text-gray-200 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>
      <h1 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight">{title}</h1>
    </header>
  )
}
