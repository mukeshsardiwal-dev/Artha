import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCashbookEntries,
  getCashbookBalance,
  createCashbookEntry,
  deleteCashbookEntry,
} from '../api/cashbook'
import { getParties } from '../api/parties'
import { today, weekStart, monthStart, quarterStart, yearStart, formatCurrency, formatDate } from '../lib/utils'
import { cn } from '../lib/utils'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import toast from 'react-hot-toast'
import { Plus, Trash2, Wallet, ArrowDownLeft, ArrowUpRight, Calendar } from 'lucide-react'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import type { CashbookEntry } from '../types'

type EntryType = 'receipt' | 'payment' | 'opening_balance'

const entryTypeOptions = [
  { value: 'receipt', label: 'Receipt (Money In)' },
  { value: 'payment', label: 'Payment (Money Out)' },
  { value: 'opening_balance', label: 'Opening Balance' },
]

const typeBadge = (type: EntryType) => {
  if (type === 'receipt') return 'success'
  if (type === 'payment') return 'danger'
  return 'default'
}

const typeLabel = (type: EntryType) => {
  if (type === 'receipt') return 'Receipt'
  if (type === 'payment') return 'Payment'
  return 'Opening Balance'
}

const emptyForm = () => ({
  type: 'receipt' as EntryType,
  amount: '',
  description: '',
  party_id: '',
  entry_date: today(),
})

export default function Cashbook() {
  const qc = useQueryClient()
  const [fromDate, setFromDate] = useState(monthStart())
  const [toDate, setToDate] = useState(today())
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [activeQuick, setActiveQuick] = useState('This Month')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const QUICK_RANGES = [
    { label: 'This Week',  from: weekStart,    to: today },
    { label: 'This Month', from: monthStart,    to: today },
    { label: 'Quarter',    from: quarterStart,  to: today },
    { label: 'This Year',  from: yearStart,     to: today },
  ]

  const applyQuick = (label: string, from: () => string, to: () => string) => {
    setActiveQuick(label)
    setFromDate(from())
    setToDate(to())
  }

  const handleCustomDate = (field: 'from' | 'to', val: string) => {
    setActiveQuick('')
    if (field === 'from') setFromDate(val)
    else setToDate(val)
  }

  const { data: entries, isLoading } = useQuery({
    queryKey: ['cashbook', fromDate, toDate],
    queryFn: () => getCashbookEntries({ from_date: fromDate, to_date: toDate }),
  })

  const { data: balance } = useQuery({
    queryKey: ['cashbook-balance'],
    queryFn: getCashbookBalance,
  })

  const { data: parties } = useQuery({
    queryKey: ['parties'],
    queryFn: () => getParties(),
  })

  const createMut = useMutation({
    mutationFn: (data: Partial<CashbookEntry>) => createCashbookEntry(data),
    onSuccess: () => {
      toast.success('Entry added')
      qc.invalidateQueries({ queryKey: ['cashbook'] })
      qc.invalidateQueries({ queryKey: ['cashbook-balance'] })
      qc.invalidateQueries({ queryKey: ['daily-report'] })
      setModalOpen(false)
      setForm(emptyForm())
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to add entry'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteCashbookEntry,
    onSuccess: () => {
      toast.success('Deleted')
      qc.invalidateQueries({ queryKey: ['cashbook'] })
      qc.invalidateQueries({ queryKey: ['cashbook-balance'] })
    },
    onError: () => toast.error('Failed to delete'),
  })

  const handleSubmit = () => {
    if (!form.amount || !form.description.trim()) {
      toast.error('Amount and description are required')
      return
    }
    if (parseFloat(form.amount) <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }
    createMut.mutate({
      type: form.type,
      amount: parseFloat(form.amount),
      description: form.description,
      party_id: form.party_id || undefined,
      entry_date: form.entry_date,
    })
  }

  const f = (field: string, val: string) => setForm(prev => ({ ...prev, [field]: val }))

  const totalReceipts = entries?.filter(e => e.type === 'receipt').reduce((s, e) => s + e.amount, 0) ?? 0
  const totalPayments = entries?.filter(e => e.type === 'payment').reduce((s, e) => s + e.amount, 0) ?? 0

  return (
    <div className="space-y-4">
      {/* Balance cards */}
      {balance && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Opening Balance', value: balance.opening_balance, color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-50 dark:bg-gray-700/30', icon: Wallet },
            { label: 'Total Receipts', value: balance.total_receipts, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', icon: ArrowDownLeft },
            { label: 'Total Payments', value: balance.total_payments, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', icon: ArrowUpRight },
            { label: 'Cash in Hand', value: balance.current_balance, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: Wallet },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <Card key={label} className="!p-4">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className={`text-xl font-bold ${color}`}>{formatCurrency(value)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="space-y-3">
          {/* Quick range pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {QUICK_RANGES.map(({ label, from, to }) => (
              <button
                key={label}
                onClick={() => applyQuick(label, from, to)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border',
                  activeQuick === label
                    ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-green-300 hover:text-green-600',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Custom dates + summary + add */}
          <div className="flex flex-wrap gap-3 items-end">
            <Input label="From" type="date" value={fromDate} onChange={e => handleCustomDate('from', e.target.value)} />
            <Input label="To" type="date" value={toDate} onChange={e => handleCustomDate('to', e.target.value)} />
            <div className="ml-auto flex gap-2 items-center">
              <span className="text-sm text-gray-500">
                In: <strong className="text-green-600">{formatCurrency(totalReceipts)}</strong>
                {' · '}
                Out: <strong className="text-red-600">{formatCurrency(totalPayments)}</strong>
              </span>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="w-4 h-4" /> Add Entry
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Entries table */}
      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner className="w-7 h-7" /></div>
        ) : !entries?.length ? (
          <EmptyState
            title="No cashbook entries"
            description="Record cash receipts and payments"
            action={<Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" />Add Entry</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 pr-4">Party</th>
                  <th className="pb-3 pr-4 text-right">Amount</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {entries.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 pr-4 text-gray-500">{formatDate(entry.entry_date)}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={typeBadge(entry.type as EntryType)}>{typeLabel(entry.type as EntryType)}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">{entry.description}</td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">
                      {parties?.find(p => p.id === entry.party_id)?.name || '—'}
                    </td>
                    <td className={`py-3 pr-4 text-right font-semibold ${entry.type === 'receipt' ? 'text-green-600' : entry.type === 'payment' ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                      {entry.type === 'payment' ? '−' : '+'}{formatCurrency(entry.amount)}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => setDeleteId(entry.id)}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Entry Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setForm(emptyForm()) }} title="New Cashbook Entry">
        <div className="space-y-4">
          <Select
            label="Entry Type"
            value={form.type}
            onChange={e => f('type', e.target.value)}
            options={entryTypeOptions}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount (₹)"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={e => f('amount', e.target.value)}
              required
            />
            <Input
              label="Date"
              type="date"
              value={form.entry_date}
              onChange={e => f('entry_date', e.target.value)}
              required
            />
          </div>
          <Input
            label="Description"
            placeholder="e.g. Payment from Ramesh Traders"
            value={form.description}
            onChange={e => f('description', e.target.value)}
            required
          />
          <Select
            label="Party (optional)"
            value={form.party_id}
            onChange={e => f('party_id', e.target.value)}
            placeholder="— Select party —"
            options={(parties || []).map(p => ({ value: p.id, label: p.name }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setModalOpen(false); setForm(emptyForm()) }}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={createMut.isPending}>Save Entry</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Entry"
        message="This cashbook entry will be permanently deleted. This cannot be undone."
        confirmLabel="Delete Entry"
        loading={deleteMut.isPending}
        onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId, { onSettled: () => setDeleteId(null) }) }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
