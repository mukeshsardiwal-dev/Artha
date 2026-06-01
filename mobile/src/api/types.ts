export interface ApiUser {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

export interface Party {
  id: string;
  business_id: string;
  name: string;
  type: string;
  phone: string | null;
  address: string | null;
  state: string | null;
  gstin: string | null;
  created_at: string;
}

export interface Item {
  id: string;
  business_id: string;
  name: string;
  category: string | null;
  unit: string;
  hsn_code: string | null;
  gst_rate: number;
  created_at: string;
}

export interface TransactionParty {
  id: string;
  business_id: string;
  name: string;
  type: string;
  phone: string | null;
  address: string | null;
  state: string | null;
  gstin: string | null;
  created_at: string;
}

export interface TransactionLineItem {
  id: string;
  item_id: string | null;
  item_name: string;
  hsn_code: string | null;
  qty: string;
  unit: string;
  rate: string;
  amount: string;
  gst_rate: number;
  cgst: string;
  sgst: string;
  igst: string;
  gst_type: string;
}

export interface Transaction {
  id: string;
  business_id: string;
  party_id: string | null;
  type: 'sale' | 'purchase';
  transaction_date: string;
  invoice_number: string | null;
  subtotal: string;
  gst_amount: string;
  total_amount: string;
  payment_status: 'unpaid' | 'partial' | 'paid';
  notes: string | null;
  created_at: string;
  line_items: TransactionLineItem[];
  party: TransactionParty | null;
}

export interface CashbookEntry {
  id: string;
  type: 'receipt' | 'payment' | 'opening_balance';
  amount: string;
  description: string;
  party_id: string | null;
  entry_date: string;
  created_at: string;
}

export interface CashbookBalance {
  opening_balance: string;
  total_receipts: string;
  total_payments: string;
  current_balance: string;
}