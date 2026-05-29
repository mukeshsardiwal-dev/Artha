import apiClient from './client'
import { API_BASE } from '../lib/utils'
import type { Party, LedgerEntry } from '../types'

export async function getParties(params?: { type?: string; search?: string }): Promise<Party[]> {
  const res = await apiClient.get<Party[]>('/parties', { params })
  return res.data
}

export async function getParty(id: string): Promise<Party> {
  const res = await apiClient.get<Party>(`/parties/${id}`)
  return res.data
}

export async function createParty(data: Partial<Party>): Promise<Party> {
  const res = await apiClient.post<Party>('/parties', data)
  return res.data
}

export async function updateParty(id: string, data: Partial<Party>): Promise<Party> {
  const res = await apiClient.put<Party>(`/parties/${id}`, data)
  return res.data
}

export async function deleteParty(id: string): Promise<void> {
  await apiClient.delete(`/parties/${id}`)
}

export async function getPartyLedger(id: string, params?: { from_date?: string; to_date?: string }): Promise<LedgerEntry[]> {
  const res = await apiClient.get<LedgerEntry[]>(`/parties/${id}/ledger`, { params })
  return res.data
}

export function getPartyLedgerPdfUrl(id: string, params: { from_date: string; to_date: string }): string {
  const token = localStorage.getItem('access_token')
  return `${API_BASE}/parties/${id}/ledger/pdf?from_date=${params.from_date}&to_date=${params.to_date}&token=${token}`
}
