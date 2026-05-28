import apiClient from './client'
import type { DailyReport, GSTSummary, PartyWiseStat } from '../types'

export async function getDailyReport(date: string): Promise<DailyReport> {
  const res = await apiClient.get<DailyReport>('/reports/daily', { params: { date } })
  return res.data
}

export async function getGSTSummary(params: { from_date: string; to_date: string }): Promise<GSTSummary> {
  const res = await apiClient.get<GSTSummary>('/reports/gst-summary', { params })
  return res.data
}

export async function getPartyWiseReport(params: { from_date: string; to_date: string }): Promise<PartyWiseStat[]> {
  const res = await apiClient.get<PartyWiseStat[]>('/reports/party-wise', { params })
  return res.data
}
