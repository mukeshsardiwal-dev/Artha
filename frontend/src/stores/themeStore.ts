import { create } from 'zustand'

interface ThemeStore {
  isDark: boolean
  toggle: () => void
}

const stored = localStorage.getItem('theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const initial = stored ? stored === 'dark' : prefersDark

if (initial) document.documentElement.classList.add('dark')

export const useThemeStore = create<ThemeStore>(set => ({
  isDark: initial,
  toggle: () =>
    set(state => {
      const next = !state.isDark
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return { isDark: next }
    }),
}))
