import { create } from 'zustand'
import type { User, Business } from '../types'

interface AuthStore {
  user: User | null
  business: Business | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setBusiness: (business: Business | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  business: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  setUser: user => set({ user, isAuthenticated: !!user }),
  setBusiness: business => set({ business }),
  logout: () => {
    localStorage.removeItem('access_token')
    set({ user: null, business: null, isAuthenticated: false })
    window.location.href = '/login'
  },
}))
