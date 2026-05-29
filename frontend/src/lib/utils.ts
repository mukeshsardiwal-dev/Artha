import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// API origin comes from VITE_API_URL (set in Vercel for prod).
// Left blank in dev → Vite proxy handles /api and /uploads.
// Trailing slashes are stripped so joining with the leading-slash prefix
// never produces a double slash (e.g. "https://host//api/v1" → 404).
const API_ORIGIN = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

// Backend route prefix, overridable via VITE_API_PREFIX (defaults to /api/v1).
const API_PREFIX = import.meta.env.VITE_API_PREFIX ?? '/api/v1'

// Base URL for all API calls.
export const API_BASE = `${API_ORIGIN}${API_PREFIX}`

// Resolve a backend asset path (e.g. /uploads/logos/x.png) to a full URL.
// Passes through absolute URLs and empty values untouched.
export function assetUrl(path?: string | null): string {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  return `${API_ORIGIN}${path}`
}

export function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount))
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function monthStart(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export function weekStart(): string {
  const d = new Date()
  const day = d.getDay() // 0 = Sun
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export function quarterStart(): string {
  const d = new Date()
  const q = Math.floor(d.getMonth() / 3)
  return `${d.getFullYear()}-${String(q * 3 + 1).padStart(2, '0')}-01`
}

export function yearStart(): string {
  return `${new Date().getFullYear()}-01-01`
}
