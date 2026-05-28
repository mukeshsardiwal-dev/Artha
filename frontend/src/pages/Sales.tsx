import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransactions, createTransaction, deleteTransaction, updatePaymentStatus, type TransactionCreatePayload, type LineItemIn } from '../api/transactions'
import { getParties } from '../api/parties'
import { getItems } from '../api/items'
import { today, monthStart, formatCurrency, formatDate } from '../lib/utils'
import { GST_RATES, UNITS } from '../lib/constants'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import InvoiceModal from '../components/InvoiceModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'
import { Plus, Trash2, FileText } from 'lucide-react'
import type { Item, Party } from '../types'

const paymentBadgeVariant = (s: string) => s === 'paid' ? 'success' : s === 'partial' ? 'warning' : 'danger'

function calcLineTotal(qty: number, rate: number) {
  return (qty || 0) * (rate || 0)
}
function calcGST(amount: number, rate: number, isSameState: boolean) {
  const tax = amount * rate / 100
  if (isSameState) return { cgst: tax / 2, sgst: tax / 2, igst: 0 }
  return { cgst: 0, sgst: 0, igst: tax }
}

interface LineFormItem {
  item_id: string
  item_name: string
  hsn_code: string
  qty: number
  unit: string
  rate: number
  gst_rate: number
}

const emptyLine = (): LineFormItem => ({ item_id: '', item_name: '', hsn_code: '', qty: 0, unit: 'kg', rate: 0, gst_rate: 5 })

export default function Sales() {
  const qc = useQueryClient()
  const [fromDate, setFromDate] = useState(monthStart())
  const [toDate, setToDate] = useState(today())
  const [invoiceId, setInvoiceId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [lines, setLines] = useState<LineFormItem[]>([emptyLine()])
  const [partyId, setPartyId] = useState('')
  const [txnDate, setTxnDate] = useState(today())
  const [notes, setNotes] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('unpaid')

  const { data: txns, isLoading } = useQuery({ queryKey: ['transactions', 'sale', fromDate, toDate], queryFn: () => getTransactions({ type: 'sale', from_date: fromDate, to_date: toDate }) })
  const { data: parties } = useQuery({ queryKey: ['parties'], queryFn: () => getParties() })
  const { data: items } = useQuery({ queryKey: ['items'], queryFn: () => getItems() })

  const selectedParty = parties?.find(p => p.id === partyId)
  const isSameState = !selectedParty?.state // treat no state as same state

  const subtotal = lines.reduce((s, l) => s + calcLineTotal(l.qty, l.rate), 0)
  const totalGST = lines.reduce((s, l) => {
    const amt = calcLineTotal(l.qty, l.rate)
    const g = calcGST(amt, l.gst_rate, isSameState)
    return s + g.cgst + g.sgst + g.igst
  }, 0)
  const grandTotal = subtotal + totalGST

  const createMut = useMutation({
    mutationFn: (data: TransactionCreatePayload) => createTransaction(data),
    onSuccess: () => {
      toast.success('Sale added successfully')
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['daily-report'] })
      setModalOpen(false)
      resetForm()
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to create sale'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['transactions'] }) },
    onError: () => toast.error('Failed to delete'),
  })

  const resetForm = () => {
    setLines([emptyLine()]); setPartyId(''); setTxnDate(today()); setNotes(''); setPaymentStatus('unpaid')
  }

  const updateLine = (idx: number, field: keyof LineFormItem, value: string | number) => {
    setLines(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      if (field === 'item_id') {
        const item = items?.find(i => i.id === value)
        if (item) {
          next[idx].item_name = item.name
          next[idx].hsn_code = item.hsn_code || ''
          next[idx].unit = item.unit
          next[idx].gst_rate = item.gst_rate
        }
      }
      return next
    })
  }

  const handleSubmit = () => {
    if (lines.some(l => !l.item_name.trim())) { toast.error('Item name is required for all rows'); return }
    if (lines.some(l => l.qty <= 0)) { toast.error('Quantity must be greater than 0'); return }
    if (lines.some(l => l.rate <= 0)) { toast.error('Rate must be greater than 0'); return }
    const payload: TransactionCreatePayload = {
      type: 'sale',
      party_id: partyId || undefined,
      transaction_date: txnDate,
      notes: notes || undefined,
      payment_status: paymentStatus,
      line_items: lines.map<LineItemIn>(l => ({
        item_id: l.item_id || undefined,
        item_name: l.item_name,
        hsn_code: l.hsn_code || undefined,
        qty: l.qty,
        unit: l.unit,
        rate: l.rate,
        gst_rate: l.gst_rate,
      })),
    }
    createMut.mutate(payload)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex gap-2 items-center">
            <Input label="From" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            <Input label="To" type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
          <Button onClick={() => setModalOpen(true)} className="ml-auto">
            <Plus className="w-4 h-4" /> Add Sale
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner className="w-7 h-7" /></div>
        ) : !txns?.length ? (
          <EmptyState title="No sales yet" description="Add your first sale entry" action={<Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" />Add Sale</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Invoice #</th>
                  <th className="pb-3 pr-4">Party</th>
                  <th className="pb-3 pr-4">Items</th>
                  <th className="pb-3 pr-4 text-right">Total</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {txns.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 pr-4 text-gray-500">{formatDate(t.transaction_date)}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{t.invoice_number || '—'}</td>
                    <td className="py-3 pr-4 font-medium">{t.party?.name || '—'}</td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">{t.line_items.map(l => l.item_name).join(', ')}</td>
                    <td className="py-3 pr-4 text-right font-semibold text-green-600">{formatCurrency(t.total_amount)}</td>
                    <td className="py-3 pr-4"><Badge variant={paymentBadgeVariant(t.payment_status)}>{t.payment_status}</Badge></td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setInvoiceId(t.id)}
                          className="p-1.5 rounded hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600"
                          title="View / Download Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Sale Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); resetForm() }} title="New Sale Entry" size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Party (Customer)"
              value={partyId}
              onChange={e => setPartyId(e.target.value)}
              placeholder="— Select party —"
              options={(parties || []).filter(p => p.type === 'customer').map(p => ({ value: p.id, label: p.name }))}
            />
            <Input label="Date" type="date" value={txnDate} onChange={e => setTxnDate(e.target.value)} required />
          </div>

          {/* Line items */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Items</div>
            {lines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-3">
                  <Select
                    placeholder="Select item"
                    value={line.item_id}
                    onChange={e => updateLine(idx, 'item_id', e.target.value)}
                    options={(items || []).map(i => ({ value: i.id, label: i.name }))}
                  />
                </div>
                <div className="col-span-2">
                  <Input placeholder="HSN" value={line.hsn_code} onChange={e => updateLine(idx, 'hsn_code', e.target.value)} />
                </div>
                <div className="col-span-1">
                  <Input placeholder="Qty" type="number" min="0.01" step="0.01" value={line.qty || ''} onChange={e => updateLine(idx, 'qty', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="col-span-1">
                  <Select value={line.unit} onChange={e => updateLine(idx, 'unit', e.target.value)} options={UNITS.map(u => ({ value: u, label: u }))} />
                </div>
                <div className="col-span-2">
                  <Input placeholder="Rate ₹" type="number" min="0.01" step="0.01" value={line.rate || ''} onChange={e => updateLine(idx, 'rate', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="col-span-1">
                  <Select value={line.gst_rate} onChange={e => updateLine(idx, 'gst_rate', parseFloat(e.target.value))} options={GST_RATES.map(r => ({ value: r, label: `${r}%` }))} />
                </div>
                <div className="col-span-1 text-right text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                  {formatCurrency(calcLineTotal(line.qty, line.rate))}
                </div>
                <div className="col-span-1">
                  <button onClick={() => setLines(prev => prev.filter((_, i) => i !== idx))} disabled={lines.length === 1} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setLines(prev => [...prev, emptyLine()])}>
              <Plus className="w-4 h-4" /> Add Row
            </Button>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">GST</span><span>{formatCurrency(totalGST)}</span></div>
            <div className="flex justify-between font-bold text-green-600 border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
              <span>Grand Total</span><span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Payment Status" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} options={[{ value: 'unpaid', label: 'Unpaid' }, { value: 'partial', label: 'Partial' }, { value: 'paid', label: 'Paid' }]} />
            <Input label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setModalOpen(false); resetForm() }}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={createMut.isPending}>Save Sale</Button>
          </div>
        </div>
      </Modal>

      {invoiceId && (
        <InvoiceModal transactionId={invoiceId} onClose={() => setInvoiceId(null)} />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Sale"
        message="This sale entry will be permanently deleted. This cannot be undone."
        confirmLabel="Delete Sale"
        loading={deleteMut.isPending}
        onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId, { onSettled: () => setDeleteId(null) }) }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
