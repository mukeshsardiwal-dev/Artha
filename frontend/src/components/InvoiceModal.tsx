import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTransaction } from '../api/transactions'
import { useAuthStore } from '../stores/authStore'
import { formatCurrency, formatDate } from '../lib/utils'
import Spinner from './ui/Spinner'
import { X, Download, Share2, CheckCircle2, Clock, AlertCircle, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  transactionId: string
  onClose: () => void
}

const statusIcon = { paid: CheckCircle2, partial: Clock, unpaid: AlertCircle }
const statusColor = {
  paid:    'text-green-600 bg-green-100 dark:bg-green-500/15 dark:text-green-400',
  partial: 'text-amber-600 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400',
  unpaid:  'text-red-600 bg-red-100 dark:bg-red-500/15 dark:text-red-400',
}

export default function InvoiceModal({ transactionId, onClose }: Props) {
  const { business } = useAuthStore()
  const [downloading, setDownloading] = useState(false)
  const [sharing, setSharing] = useState(false)

  const { data: txn, isLoading } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => getTransaction(transactionId),
  })

  const fetchPdfBlob = async (): Promise<Blob> => {
    const token = localStorage.getItem('access_token')
    const base = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/api/v1`
      : '/api/v1'
    const res = await fetch(`${base}/invoices/${transactionId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Server error ${res.status}`)
    return res.blob()
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await fetchPdfBlob()
      const ext = blob.type.includes('html') ? 'html' : 'pdf'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${txn?.invoice_number ?? transactionId}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to download invoice')
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    setSharing(true)
    try {
      const blob = await fetchPdfBlob()
      const ext = blob.type.includes('html') ? 'html' : 'pdf'
      const fileName = `invoice-${txn?.invoice_number ?? transactionId}.${ext}`
      const file = new File([blob], fileName, { type: blob.type })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `Invoice ${txn?.invoice_number ?? ''}`,
          text: `Invoice from ${business?.name ?? 'Artha'} — ${formatCurrency(txn?.total_amount ?? 0)}`,
          files: [file],
        })
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Downloaded — Web Share not supported on this browser')
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') toast.error('Could not share invoice')
    } finally {
      setSharing(false)
    }
  }

  const StatusIcon = txn ? statusIcon[txn.payment_status as keyof typeof statusIcon] : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[95vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">
            Invoice {txn?.invoice_number ? `#${txn.invoice_number}` : ''}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading || isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 transition-colors border border-gray-200 dark:border-gray-600"
            >
              {downloading ? <Spinner className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              Download
            </button>
            <button
              onClick={handleShare}
              disabled={sharing || isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 transition-colors"
            >
              {sharing ? <Spinner className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              Share
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice preview */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>
          ) : !txn ? (
            <p className="text-center text-gray-400 py-20">Invoice not found</p>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print:shadow-none">
              {/* Invoice top stripe */}
              <div className="h-1.5 bg-gradient-to-r from-green-600 to-emerald-500" />

              <div className="p-8 space-y-6">
                {/* Business + Invoice meta */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xl font-bold text-green-700">{business?.name}</span>
                    </div>
                    {business?.address && <p className="text-xs text-gray-500 ml-10">{business.address}</p>}
                    <p className="text-xs text-gray-500 ml-10">State: {business?.state}</p>
                    {business?.gstin && <p className="text-xs text-gray-500 ml-10">GSTIN: {business.gstin}</p>}
                    {business?.phone && <p className="text-xs text-gray-500 ml-10">Ph: {business.phone}</p>}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800 tracking-tight">TAX INVOICE</div>
                    {txn.invoice_number && (
                      <div className="text-sm text-gray-500 mt-1">#{txn.invoice_number}</div>
                    )}
                    <div className="text-sm text-gray-500">{formatDate(txn.transaction_date)}</div>
                    {StatusIcon && (
                      <div className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor[txn.payment_status as keyof typeof statusColor]}`}>
                        <StatusIcon className="w-3 h-3" />
                        {txn.payment_status.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bill To */}
                {txn.party && (
                  <div className="bg-gray-50 rounded-xl p-4 flex justify-between gap-4">
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Bill To</div>
                      <div className="font-semibold text-gray-800">{txn.party.name}</div>
                      {txn.party.address && <div className="text-xs text-gray-500 mt-0.5">{txn.party.address}</div>}
                      {txn.party.state && <div className="text-xs text-gray-500">{txn.party.state}</div>}
                      {txn.party.gstin && <div className="text-xs font-mono text-gray-400 mt-0.5">GSTIN: {txn.party.gstin}</div>}
                      {txn.party.phone && <div className="text-xs text-gray-500">Ph: {txn.party.phone}</div>}
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div className="text-gray-400 uppercase tracking-wider mb-1">Supply</div>
                      <div>Type: {txn.type === 'sale' ? 'Sale' : 'Purchase'}</div>
                      <div>Place: {txn.party.state ?? business?.state}</div>
                    </div>
                  </div>
                )}

                {/* Line items */}
                <div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-green-700 text-white text-xs">
                        <th className="text-left px-3 py-2 rounded-tl-lg">#</th>
                        <th className="text-left px-3 py-2">Item</th>
                        <th className="text-left px-3 py-2">HSN</th>
                        <th className="text-right px-3 py-2">Qty</th>
                        <th className="text-left px-3 py-2">Unit</th>
                        <th className="text-right px-3 py-2">Rate (₹)</th>
                        <th className="text-right px-3 py-2">Amount (₹)</th>
                        <th className="text-right px-3 py-2 rounded-tr-lg">Tax</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {txn.line_items.map((li, idx) => (
                        <tr key={idx} className={idx % 2 === 1 ? 'bg-gray-50' : ''}>
                          <td className="px-3 py-2.5 text-gray-400 text-xs">{idx + 1}</td>
                          <td className="px-3 py-2.5 font-medium text-gray-800">{li.item_name}</td>
                          <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{li.hsn_code || '—'}</td>
                          <td className="px-3 py-2.5 text-right text-gray-700">{li.qty}</td>
                          <td className="px-3 py-2.5 text-gray-500 text-xs">{li.unit}</td>
                          <td className="px-3 py-2.5 text-right text-gray-700">{formatCurrency(li.rate)}</td>
                          <td className="px-3 py-2.5 text-right font-medium text-gray-800">{formatCurrency(li.amount)}</td>
                          <td className="px-3 py-2.5 text-right text-xs text-gray-500">
                            {li.gst_type === 'igst' ? (
                              <span>IGST {formatCurrency(li.igst)}</span>
                            ) : (
                              <span>C+S {formatCurrency(Number(li.cgst) + Number(li.sgst))}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span className="font-medium text-gray-700">{formatCurrency(txn.subtotal)}</span>
                    </div>
                    {txn.line_items.some(l => Number(l.cgst) > 0) && (
                      <>
                        <div className="flex justify-between text-gray-500">
                          <span>CGST</span>
                          <span>{formatCurrency(txn.line_items.reduce((s, l) => s + Number(l.cgst), 0))}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>SGST</span>
                          <span>{formatCurrency(txn.line_items.reduce((s, l) => s + Number(l.sgst), 0))}</span>
                        </div>
                      </>
                    )}
                    {txn.line_items.some(l => Number(l.igst) > 0) && (
                      <div className="flex justify-between text-gray-500">
                        <span>IGST</span>
                        <span>{formatCurrency(txn.line_items.reduce((s, l) => s + Number(l.igst), 0))}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-green-700 text-base border-t border-gray-200 pt-2 mt-2">
                      <span>Grand Total</span>
                      <span>{formatCurrency(txn.total_amount)}</span>
                    </div>
                  </div>
                </div>

                {txn.notes && (
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                    <span className="font-medium">Notes:</span> {txn.notes}
                  </div>
                )}

                {/* Footer */}
                <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
                  Computer generated invoice · Artha — Smart Accounting for Businesses
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
