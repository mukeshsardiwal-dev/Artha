import apiClient from './client'
import type { Business } from '../types'

export async function getBusiness(): Promise<Business> {
  const res = await apiClient.get<Business>('/business')
  return res.data
}

export async function createBusiness(data: Partial<Business>): Promise<Business> {
  const res = await apiClient.post<Business>('/business', data)
  return res.data
}

export async function updateBusiness(data: Partial<Business>): Promise<Business> {
  const res = await apiClient.put<Business>('/business', data)
  return res.data
}

export async function uploadBusinessLogo(file: File): Promise<Business> {
  const form = new FormData()
  form.append('file', file)
  const res = await apiClient.post<Business>('/business/logo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function deleteBusinessLogo(): Promise<Business> {
  const res = await apiClient.delete<Business>('/business/logo')
  return res.data
}

export interface SubscriptionPlan {
  plan: string
  label: string
  amount: number
  amount_display: string
  months: number
  per_month: string
  savings: string | null
}

export interface CreateOrderPayload {
  plan: string
  name?: string
  state?: string
  address?: string
  gstin?: string
  phone?: string
}

export interface CreateOrderResponse {
  order_id: string
  amount: number
  currency: string
  plan: string
  key_id: string
  business_name: string
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const res = await apiClient.get<SubscriptionPlan[]>('/business/subscription/plans')
  return res.data
}

export async function createSubscriptionOrder(data: CreateOrderPayload): Promise<CreateOrderResponse> {
  const res = await apiClient.post<CreateOrderResponse>('/business/subscription/create-order', data)
  return res.data
}

export async function verifySubscriptionPayment(data: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  plan: string
}): Promise<Business> {
  const res = await apiClient.post<Business>('/business/subscription/verify', data)
  return res.data
}

export async function activateSubscription(data: CreateOrderPayload): Promise<Business> {
  const res = await apiClient.post<Business>('/business/subscription/activate', data)
  return res.data
}
