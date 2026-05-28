import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, ShoppingCart, Users, Package,
  Wallet, BarChart2, Settings, Moon, Sun, LogOut, BookOpen,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { cn } from '../../lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sales', icon: TrendingUp, label: 'Sales' },
  { to: '/purchases', icon: ShoppingCart, label: 'Purchases' },
  { to: '/parties', icon: Users, label: 'Parties' },
  { to: '/items', icon: Package, label: 'Items' },
  { to: '/cashbook', icon: Wallet, label: 'Cashbook' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, business, logout } = useAuthStore()
  const { isDark, toggle } = useThemeStore()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-300',
        'bg-forest-900',
        'lg:translate-x-0 lg:static lg:z-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        {/* Top accent line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-green-500 via-green-400 to-emerald-500" />

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          {business?.logo_url ? (
            <img
              src={business.logo_url}
              alt={business.name}
              className="w-9 h-9 rounded-xl object-contain bg-white/10 flex-shrink-0 ring-1 ring-white/10"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0 ring-1 ring-green-500/30">
              <BookOpen className="w-5 h-5 text-green-400" />
            </div>
          )}
          <div className="min-w-0">
            <div className="font-bold text-base text-white leading-tight tracking-tight">Artha</div>
            <div className="text-xs text-green-400 truncate max-w-[140px] mt-0.5">{business?.name || 'Set up business'}</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-green-500/15 text-green-300 ring-1 ring-green-500/20'
                  : 'text-green-200/60 hover:bg-white/5 hover:text-green-100',
              )}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0 text-green-400/70" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom user section */}
        <div className="px-3 py-3 border-t border-white/5 space-y-1">
          {/* User pill */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 ring-2 ring-green-400/30">
              <span className="text-sm font-bold text-white">
                {(user?.full_name || user?.email || '?')[0].toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-green-200/80 truncate">{user?.full_name || user?.email}</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-green-300/70 hover:bg-white/5 hover:text-green-200 transition-all duration-150"
          >
            {isDark
              ? <Sun className="w-[18px] h-[18px] text-amber-400" />
              : <Moon className="w-[18px] h-[18px] text-blue-400" />
            }
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-green-300/70 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
