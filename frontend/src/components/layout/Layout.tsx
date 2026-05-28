import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import Sidebar from './Sidebar'
import Header from './Header'
import SubscriptionModal from '../SubscriptionModal'
import { useQuery } from '@tanstack/react-query'
import { getMe } from '../../api/auth'
import { getBusiness } from '../../api/business'

export default function Layout() {
  const { isAuthenticated, setUser, setBusiness, business } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const user = await getMe()
      setUser(user)
      return user
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })

  const { data: bizData, isLoading: bizLoading } = useQuery({
    queryKey: ['business'],
    queryFn: async () => {
      try {
        const b = await getBusiness()
        setBusiness(b)
        return b
      } catch {
        setBusiness(null)
        return null
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // Determine if subscription gate should show
  // Allow /settings so users can manage their profile
  const isSettingsPage = location.pathname === '/settings'
  const needsSetup = !bizLoading && !bizData
  const isExpired = !bizLoading && bizData && bizData.subscription_status === 'expired'
  const isPending = !bizLoading && bizData && bizData.subscription_status === 'pending'
  const showGate = !isSettingsPage && (needsSetup || isExpired || isPending)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#0d1117]">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-green-50/60 dark:bg-[#0d1117]">
          <Outlet />
        </main>
      </div>

      {showGate && (
        <SubscriptionModal mode={isExpired || isPending ? 'renew' : 'setup'} />
      )}
    </div>
  )
}
