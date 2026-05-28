import apiClient from './client'
import type { User } from '../types'

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const res = await apiClient.post<TokenResponse>('/auth/login', { email, password })
  return res.data
}

export async function register(data: { email: string; password: string; full_name: string; phone?: string }): Promise<TokenResponse> {
  const res = await apiClient.post<TokenResponse>('/auth/register', data)
  return res.data
}

export async function getMe(): Promise<User> {
  const res = await apiClient.get<User>('/auth/me')
  return res.data
}

export async function updateProfile(data: { full_name?: string; phone?: string; email?: string }): Promise<User> {
  const res = await apiClient.put<User>('/auth/me', data)
  return res.data
}

export async function changePassword(data: { current_password: string; new_password: string }): Promise<User> {
  const res = await apiClient.put<User>('/auth/me/password', data)
  return res.data
}
