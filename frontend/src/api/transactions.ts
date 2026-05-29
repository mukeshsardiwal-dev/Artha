import apiClient from './client'
import { API_BASE } from '../lib/utils'
import type { Transaction } from '../types'

export interface TransactionParams {
  type?: string
  from_date?: string
  to_date?: string
  party_id?: string
  payment_status?: string
}

export interface LineItemIn {
  item_id?: string
  item_name: string
  hsn_code?: string
  qty: number
  unit: string
  rate: number
  gst_rate: number
}

export interface TransactionCreatePayload {
  type: 'sale' | 'purchase'
  party_id?: string
  transaction_date: string
  line_items: LineItemIn[]
  notes?: string
  payment_status: string
}

export async function getTransactions(params?: TransactionParams): Promise<Transaction[]> {
  const res = await apiClient.get<Transaction[]>('/transactions', { params })
  return res.data
}

export async function getTransaction(id: string): Promise<Transaction> {
  const res = await apiClient.get<Transaction>(`/transactions/${id}`)
  return res.data
}

export async function createTransaction(data: TransactionCreatePayload): Promise<Transaction> {
  const res = await apiClient.post<Transaction>('/transactions', data)
  return res.data
}

export async function updateTransaction(id: string, data: Partial<TransactionCreatePayload>): Promise<Transaction> {
  const res = await apiClient.put<Transaction>(`/transactions/${id}`, data)
  return res.data
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiClient.delete(`/transactions/${id}`)
}

export async function updatePaymentStatus(id: string, payment_status: string): Promise<Transaction> {
  const res = await apiClient.patch<Transaction>(`/transactions/${id}/payment`, null, { params: { payment_status } })
  return res.data
}

export function getInvoicePdfUrl(transactionId: string): string {
  const token = localStorage.getItem('access_token')
  return `${API_BASE}/invoices/${transactionId}/pdf?token=${token}`
}
