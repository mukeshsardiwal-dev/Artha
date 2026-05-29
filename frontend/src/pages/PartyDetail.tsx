import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getParty, getPartyLedger } from '../api/parties'
import { today, weekStart, monthStart, quarterStart, formatCurrency, formatDate, API_BASE } from '../lib/utils'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'
import { ArrowLeft, Download, Share2, Calendar } from 'lucide-react'
import { cn } from '../lib/utils'

const QUICK_RANGES = [
  { label: 'Today',     from: () => today(),        to: () => today() },
  { label: 'This Week', from: () => weekStart(),     to: () => today() },
  { label: 'This Month',from: () => monthStart(),    to: () => today() },
  { label: 'Quarter',   from: () => quarterStart(),  to: () => today() },
]

export default function PartyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [fromDate, setFromDate] = useState(monthStart())
  const [toDate, setToDate] = useState(today())
  const [activeQuick, setActiveQuick] = useState('This Month')
  const [sharing, setSharing] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const { data: party, isLoading: partyLoading } = useQuery({
    queryKey: ['party', id],
    queryFn: () => getParty(id!),
  })

  const { data: ledger, isLoading: ledgerLoading } = useQuery({
    queryKey: ['ledger', id, fromDate, toDate],
    queryFn: () => getPartyLedger(id!, { from_date: fromDate, to_date: toDate }),
  })

  const netBalance = ledger?.length ? ledger[ledger.length - 1].balance : 0

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

  const fetchLedgerBlob = async (): Promise<Blob> => {
    const token = localStorage.getItem('access_token')
    const url = `${API_BASE}/parties/${id}/ledger/pdf?from_date=${fromDate}&to_date=${toDate}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}))
      throw new Error(detail?.detail || `Server error ${res.status}`)
    }
    return res.blob()
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await fetchLedgerBlob()
      const ext = blob.type.includes('html') ? 'html' : 'pdf'
      const objUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objUrl
      a.download = `${party?.name ?? 'ledger'}-${fromDate}-to-${toDate}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(objUrl)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to download ledger')
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    setSharing(true)
    try {
      const blob = await fetchLedgerBlob()
      const ext = blob.type.includes('html') ? 'html' : 'pdf'
      const fileName = `${party?.name ?? 'ledger'}-ledger.${ext}`
      const file = new File([blob], fileName, { type: blob.type })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${party?.name} Ledger`,
          text: `Ledger statement for ${party?.name} — ${formatDate(fromDate)} to ${formatDate(toDate)}`,
          files: [file],
        })
      } else {
        // Fallback: download instead
        const objUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = objUrl
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(objUrl)
        toast.success('Downloaded — Web Share not supported on this browser')
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') toast.error(err?.message || 'Could not share PDF')
    } finally {
      setSharing(false)
    }
  }

  if (partyLoading) return <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>
  if (!party) return <div className="text-center py-16 text-gray-500">Party not found</div>

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate('/parties')} size="sm">
        <ArrowLeft className="w-4 h-4" /> Back to Parties
      </Button>

      {/* Party info */}
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{party.name}</h2>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <Badge variant={party.type === 'customer' ? 'info' : 'default'}>{party.type}</Badge>
              {party.state && <span className="text-sm text-gray-500">{party.state}</span>}
            </div>
            {party.phone && <p className="text-sm text-gray-500 mt-2">{party.phone}</p>}
            {party.gstin && <p className="text-xs font-mono text-gray-400 mt-0.5">GSTIN: {party.gstin}</p>}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-gray-500 mb-1">Net Outstanding</div>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(Math.abs(netBalance))}
            </div>
            <div className="text-xs text-gray-400">{netBalance >= 0 ? 'You will receive' : 'You owe'}</div>
          </div>
        </div>
      </Card>

      {/* Filters + Share */}
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

          {/* Custom date range + actions */}
          <div className="flex flex-wrap gap-3 items-end">
            <Input
              label="From"
              type="date"
              value={fromDate}
              onChange={e => handleCustomDate('from', e.target.value)}
            />
            <Input
              label="To"
              type="date"
              value={toDate}
              onChange={e => handleCustomDate('to', e.target.value)}
            />
            <div className="flex gap-2 ml-auto">
              <Button variant="secondary" size="sm" onClick={handleDownload} isLoading={downloading}>
                <Download className="w-4 h-4" /> Download PDF
              </Button>
              <Button variant="secondary" size="sm" onClick={handleShare} isLoading={sharing}>
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Ledger table */}
      <Card
        title={`Ledger — ${formatDate(fromDate)} to ${formatDate(toDate)}`}
        action={
          ledger?.length ? (
            <span className="text-xs text-gray-400">{ledger.length} entries</span>
          ) : undefined
        }
      >
        {ledgerLoading ? (
          <div className="flex justify-center py-12"><Spinner className="w-7 h-7" /></div>
        ) : !ledger?.length ? (
          <p className="text-center text-gray-400 py-10">No transactions in this period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 pr-4 text-right">Debit (Dr)</th>
                  <th className="pb-3 pr-4 text-right">Credit (Cr)</th>
                  <th className="pb-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {ledger.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{formatDate(entry.date)}</td>
                    <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">{entry.description}</td>
                    <td className="py-3 pr-4 text-right text-red-600 font-medium">
                      {entry.entry_type === 'debit' ? formatCurrency(entry.amount) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-right text-green-600 font-medium">
                      {entry.entry_type === 'credit' ? formatCurrency(entry.amount) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                    <td className={`py-3 text-right font-semibold ${entry.balance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(Math.abs(entry.balance))}
                      <span className="text-xs ml-1 font-normal">{entry.balance >= 0 ? 'Dr' : 'Cr'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Summary footer */}
              <tfoot>
                <tr className="border-t-2 border-gray-200 dark:border-gray-700 font-semibold text-sm">
                  <td colSpan={2} className="pt-3 text-gray-600 dark:text-gray-400">Closing Balance</td>
                  <td className="pt-3 pr-4 text-right text-red-600">
                    {formatCurrency(ledger.filter(e => e.entry_type === 'debit').reduce((s, e) => s + e.amount, 0))}
                  </td>
                  <td className="pt-3 pr-4 text-right text-green-600">
                    {formatCurrency(ledger.filter(e => e.entry_type === 'credit').reduce((s, e) => s + e.amount, 0))}
                  </td>
                  <td className={`pt-3 text-right text-lg ${netBalance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(Math.abs(netBalance))}
                    <span className="text-xs ml-1 font-normal">{netBalance >= 0 ? 'Dr' : 'Cr'}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
