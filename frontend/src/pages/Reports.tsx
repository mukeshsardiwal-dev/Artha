import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDailyReport, getGSTSummary, getPartyWiseReport } from '../api/reports'
import { today, monthStart, formatCurrency } from '../lib/utils'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

type Tab = 'daily' | 'gst' | 'party'

// Muted, pastel-friendly chart palette
const BAR_COLORS  = ['#6ee7b7', '#86efac', '#a7f3d0', '#4ade80', '#34d399']
const PIE_COLORS  = ['#6ee7b7', '#fcd34d']   // soft green + soft amber

const dailyStats = [
  { key: 'total_sales',            label: 'Total Sales',     valueColor: 'text-green-600  dark:text-green-400'  },
  { key: 'total_purchases',        label: 'Total Purchases', valueColor: 'text-amber-600  dark:text-amber-400'  },
  { key: 'gross_profit',           label: 'Gross Profit',    valueColor: (v: number) => v >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500 dark:text-rose-400' },
  { key: 'cash_in_hand',           label: 'Cash in Hand',    valueColor: 'text-violet-600 dark:text-violet-400' },
  { key: 'outstanding_receivable', label: 'Receivable',      valueColor: 'text-teal-600   dark:text-teal-400'   },
  { key: 'outstanding_payable',    label: 'Payable',         valueColor: 'text-rose-500   dark:text-rose-400'   },
]

export default function Reports() {
  const [tab, setTab] = useState<Tab>('daily')
  const [date, setDate] = useState(today())
  const [fromDate, setFromDate] = useState(monthStart())
  const [toDate, setToDate] = useState(today())

  const dailyQ = useQuery({
    queryKey: ['daily-report', date],
    queryFn: () => getDailyReport(date),
    enabled: tab === 'daily',
  })

  const gstQ = useQuery({
    queryKey: ['gst-summary', fromDate, toDate],
    queryFn: () => getGSTSummary({ from_date: fromDate, to_date: toDate }),
    enabled: tab === 'gst',
  })

  const partyQ = useQuery({
    queryKey: ['party-wise', fromDate, toDate],
    queryFn: () => getPartyWiseReport({ from_date: fromDate, to_date: toDate }),
    enabled: tab === 'party',
  })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'daily', label: 'Daily Report' },
    { key: 'gst',   label: 'GST Summary'  },
    { key: 'party', label: 'Party-wise'   },
  ]

  return (
    <div className="space-y-4">
      {/* Tab bar + date filters */}
      <Card>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  tab === t.key
                    ? 'bg-green-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'daily' ? (
            <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
          ) : (
            <div className="flex gap-2 items-center">
              <Input label="From" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
              <Input label="To"   type="date" value={toDate}   onChange={e => setToDate(e.target.value)}   />
            </div>
          )}
        </div>
      </Card>

      {/* ── Daily Report ── */}
      {tab === 'daily' && (
        dailyQ.isLoading
          ? <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>
          : dailyQ.data
          ? (
            <div className="space-y-4">
              {/* Stat grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {dailyStats.map(({ key, label, valueColor }) => {
                  const val = dailyQ.data[key as keyof typeof dailyQ.data] as number
                  const cls = typeof valueColor === 'function' ? valueColor(val) : valueColor
                  return (
                    <Card key={key} className="!p-4">
                      <div className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">{label}</div>
                      <div className={`text-lg font-semibold ${cls}`}>{formatCurrency(val)}</div>
                    </Card>
                  )
                })}
              </div>

              {/* Top items bar chart */}
              {dailyQ.data.top_items.length > 0 && (
                <Card title="Top Selling Items">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={dailyQ.data.top_items} layout="vertical">
                      <XAxis type="number" tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} fontSize={11} tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="item_name" width={100} fontSize={11} tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(v: number) => formatCurrency(v)}
                        contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}
                      />
                      <Bar dataKey="amount" radius={4}>
                        {dailyQ.data.top_items.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>
          )
          : null
      )}

      {/* ── GST Summary ── */}
      {tab === 'gst' && (
        gstQ.isLoading
          ? <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>
          : gstQ.data
          ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sales tax */}
                <Card title="Sales Tax Collected">
                  <div className="space-y-2.5 text-sm">
                    {[
                      { label: 'Taxable Sales',    value: gstQ.data.total_taxable_sales      },
                      { label: 'CGST Collected',   value: gstQ.data.total_cgst_collected     },
                      { label: 'SGST Collected',   value: gstQ.data.total_sgst_collected     },
                      { label: 'IGST Collected',   value: gstQ.data.total_igst_collected     },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between">
                        <span className="text-gray-400 dark:text-gray-500">{r.label}</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(r.value)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-gray-100 dark:border-gray-700 pt-2 font-semibold text-green-600 dark:text-green-400">
                      <span>Total Collected</span>
                      <span>{formatCurrency(gstQ.data.tax_collected)}</span>
                    </div>
                  </div>
                </Card>

                {/* Purchase tax */}
                <Card title="Purchase Tax Paid">
                  <div className="space-y-2.5 text-sm">
                    {[
                      { label: 'Taxable Purchases', value: gstQ.data.total_taxable_purchases },
                      { label: 'CGST Paid',          value: gstQ.data.total_cgst_paid        },
                      { label: 'SGST Paid',          value: gstQ.data.total_sgst_paid        },
                      { label: 'IGST Paid',          value: gstQ.data.total_igst_paid        },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between">
                        <span className="text-gray-400 dark:text-gray-500">{r.label}</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(r.value)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-gray-100 dark:border-gray-700 pt-2 font-semibold text-amber-600 dark:text-amber-400">
                      <span>Total Paid (ITC)</span>
                      <span>{formatCurrency(gstQ.data.tax_paid)}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Net liability */}
              <Card>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">Net GST Liability</div>
                    <div className={`text-2xl font-semibold mt-1 ${gstQ.data.net_gst_liability >= 0 ? 'text-rose-500 dark:text-rose-400' : 'text-teal-600 dark:text-teal-400'}`}>
                      {formatCurrency(Math.abs(gstQ.data.net_gst_liability))}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {gstQ.data.net_gst_liability >= 0 ? 'Payable to Government' : 'Input Credit Available'}
                    </div>
                  </div>
                  <ResponsiveContainer width={150} height={110}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Tax Collected', value: gstQ.data.tax_collected },
                          { name: 'Tax Paid (ITC)', value: gstQ.data.tax_paid     },
                        ]}
                        cx="50%" cy="50%"
                        innerRadius={28} outerRadius={50}
                        dataKey="value"
                      >
                        {PIE_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                      </Pie>
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 10, color: '#9ca3af' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )
          : null
      )}

      {/* ── Party-wise ── */}
      {tab === 'party' && (
        partyQ.isLoading
          ? <div className="flex justify-center py-16"><Spinner className="w-8 h-8" /></div>
          : partyQ.data?.length
          ? (
            <Card title="Party-wise Summary">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-xs text-gray-400 uppercase tracking-wider">
                      <th className="pb-3 pr-4">Party</th>
                      <th className="pb-3 pr-4 text-right">Total Sales</th>
                      <th className="pb-3 pr-4 text-right">Total Purchases</th>
                      <th className="pb-3 text-right">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {partyQ.data.map(p => (
                      <tr key={p.party_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 pr-4 font-medium text-gray-800 dark:text-gray-200">{p.party_name}</td>
                        <td className="py-3 pr-4 text-right text-green-600 dark:text-green-400 font-medium">{formatCurrency(p.total_sales)}</td>
                        <td className="py-3 pr-4 text-right text-amber-600 dark:text-amber-400 font-medium">{formatCurrency(p.total_purchases)}</td>
                        <td className={`py-3 text-right font-semibold ${p.outstanding >= 0 ? 'text-rose-500 dark:text-rose-400' : 'text-teal-600 dark:text-teal-400'}`}>
                          {formatCurrency(Math.abs(p.outstanding))}
                          <span className="text-xs ml-1 font-normal">{p.outstanding >= 0 ? 'Dr' : 'Cr'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )
          : (
            <Card>
              <p className="text-center text-gray-400 py-12">No party data for this period</p>
            </Card>
          )
      )}
    </div>
  )
}
