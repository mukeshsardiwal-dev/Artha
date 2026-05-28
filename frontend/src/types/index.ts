export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  is_active: boolean
  created_at: string
}

export interface Business {
  id: string
  name: string
  address?: string
  state: string
  gstin?: string
  phone?: string
  logo_url?: string
  subscription_plan?: string
  subscription_status: 'trial' | 'active' | 'expired' | 'pending'
  trial_ends_at?: string
  subscription_ends_at?: string
  created_at: string
}

export interface Party {
  id: string
  business_id: string
  name: string
  type: 'customer' | 'supplier'
  phone?: string
  address?: string
  state?: string
  gstin?: string
  created_at: string
}

export interface Item {
  id: string
  business_id: string
  name: string
  name_hindi?: string
  category?: string
  unit: string
  hsn_code?: string
  gst_rate: number
  created_at: string
}

export interface LineItem {
  id?: string
  item_id?: string
  item_name: string
  hsn_code?: string
  qty: number
  unit: string
  rate: number
  amount: number
  gst_rate: number
  cgst: number
  sgst: number
  igst: number
  gst_type: 'cgst_sgst' | 'igst'
}

export interface Transaction {
  id: string
  business_id: string
  party_id?: string
  type: 'sale' | 'purchase'
  transaction_date: string
  invoice_number?: string
  subtotal: number
  gst_amount: number
  total_amount: number
  payment_status: 'unpaid' | 'partial' | 'paid'
  notes?: string
  created_at: string
  line_items: LineItem[]
  party?: Party
}

export interface CashbookEntry {
  id: string
  type: 'receipt' | 'payment' | 'opening_balance'
  amount: number
  description: string
  party_id?: string
  entry_date: string
  created_at: string
}

export interface CashbookBalance {
  opening_balance: number
  total_receipts: number
  total_payments: number
  current_balance: number
}

export interface LedgerEntry {
  date: string
  description: string
  amount: number
  entry_type: 'debit' | 'credit'
  balance: number
  transaction_id?: string
}

export interface ItemStat {
  item_name: string
  amount: number
  percentage: number
}

export interface DailyReport {
  date: string
  total_sales: number
  total_purchases: number
  gross_profit: number
  cash_in_hand: number
  outstanding_receivable: number
  outstanding_payable: number
  top_items: ItemStat[]
}

export interface GSTSummary {
  from_date: string
  to_date: string
  total_taxable_sales: number
  total_taxable_purchases: number
  total_cgst_collected: number
  total_sgst_collected: number
  total_igst_collected: number
  total_cgst_paid: number
  total_sgst_paid: number
  total_igst_paid: number
  tax_collected: number
  tax_paid: number
  net_gst_liability: number
}

export interface PartyWiseStat {
  party_id: string
  party_name: string
  total_sales: number
  total_purchases: number
  outstanding: number
}
