import apiClient from './client'
import type { Item } from '../types'

export async function getItems(params?: { search?: string }): Promise<Item[]> {
  const res = await apiClient.get<Item[]>('/items', { params })
  return res.data
}

export async function createItem(data: Partial<Item>): Promise<Item> {
  const res = await apiClient.post<Item>('/items', data)
  return res.data
}

export async function updateItem(id: string, data: Partial<Item>): Promise<Item> {
  const res = await apiClient.put<Item>(`/items/${id}`, data)
  return res.data
}

export async function deleteItem(id: string): Promise<void> {
  await apiClient.delete(`/items/${id}`)
}
