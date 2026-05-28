import apiClient from './client'
import type { CashbookEntry, CashbookBalance } from '../types'

export async function getCashbookEntries(params?: { from_date?: string; to_date?: string }): Promise<CashbookEntry[]> {
  const res = await apiClient.get<CashbookEntry[]>('/cashbook', { params })
  return res.data
}

export async function getCashbookBalance(): Promise<CashbookBalance> {
  const res = await apiClient.get<CashbookBalance>('/cashbook/balance')
  return res.data
}

export async function createCashbookEntry(data: Partial<CashbookEntry>): Promise<CashbookEntry> {
  const res = await apiClient.post<CashbookEntry>('/cashbook/entries', data)
  return res.data
}

export async function updateCashbookEntry(id: string, data: Partial<CashbookEntry>): Promise<CashbookEntry> {
  const res = await apiClient.put<CashbookEntry>(`/cashbook/entries/${id}`, data)
  return res.data
}

export async function deleteCashbookEntry(id: string): Promise<void> {
  await apiClient.delete(`/cashbook/entries/${id}`)
}
