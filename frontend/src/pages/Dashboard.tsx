import { useQuery } from '@tanstack/react-query'
import { getDailyReport } from '../api/reports'
import { today, formatCurrency } from '../lib/utils'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ShoppingCart, Wallet, BarChart2, TrendingDown, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const statCards = [
  { key: 'total_sales',           label: "Today's Sales",     icon: TrendingUp,  iconColor: 'text-green-500',   bg: 'bg-green-50/70   dark:bg-green-500/10',  valueColor: 'text-green-700   dark:text-green-400'  },
  { key: 'total_purchases',       label: "Today's Purchases",  icon: ShoppingCart, iconColor: 'text-amber-500',   bg: 'bg-amber-50/70   dark:bg-amber-500/10',  valueColor: 'text-amber-700   dark:text-amber-400'  },
  { key: 'gross_profit',          label: 'Gross Profit',       icon: BarChart2,    iconColor: 'text-blue-500',    bg: 'bg-blue-50/70    dark:bg-blue-500/10',   valueColor: 'text-blue-700    dark:text-blue-400'   },
  { key: 'cash_in_hand',          label: 'Cash in Hand',       icon: Wallet,       iconColor: 'text-violet-500',  bg: 'bg-violet-50/70  dark:bg-violet-500/10', valueColor: 'text-violet-700  dark:text-violet-400' },
  { key: 'outstanding_receivable',label: 'Receivable',         icon: TrendingUp,   iconColor: 'text-teal-500',    bg: 'bg-teal-50/70    dark:bg-teal-500/10',   valueColor: 'text-teal-700    dark:text-teal-400'   },
  { key: 'outstanding_payable',   label: 'Payable',            icon: TrendingDown, iconColor: 'text-rose-500',    bg: 'bg-rose-50/70    dark:bg-rose-500/10',   valueColor: 'text-rose-700    dark:text-rose-400'   },
]

const paymentBadge = (status: string) =>
  status === 'paid' ? 'success' : status === 'partial' ? 'warning' : 'danger'

export default function Dashboard() {
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['daily-report', today()],
    queryFn: () => getDailyReport(today()),
    retry: false,
  })

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner className="w-8 h-8" /></div>

  if (isError || !data) {
    const msg = (error as any)?.response?.data?.detail || 'Failed to load dashboard.'
    const needsBusiness = msg.toLowerCase().includes('business')
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {needsBusiness ? 'Business profile not set up' : 'Could not load dashboard'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{msg}</p>
        </div>
        {needsBusiness && (
          <Button onClick={() => navigate('/settings')}>Set up Business Profile</Button>
        )}
      </div>
    )
  }

  const report = data

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(({ key, label, icon: Icon, iconColor, bg, valueColor }) => (
          <Card key={key} className="!p-4">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div className={`text-lg font-semibold ${valueColor}`}>
              {formatCurrency(report[key as keyof typeof report] as number)}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top items chart */}
        <Card title="Top Items Today">
          {report.top_items.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No sales today</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={report.top_items} layout="vertical">
                <XAxis type="number" tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} fontSize={11} />
                <YAxis type="category" dataKey="item_name" width={90} fontSize={11} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="amount" radius={4}>
                  {report.top_items.map((_, i) => (
                    <Cell key={i} fill={['#4ade80', '#6ee7b7', '#86efac', '#a7f3d0', '#34d399'][i % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Quick actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '+ Add Sale', onClick: () => navigate('/sales'), color: 'bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-500/10 dark:hover:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/20' },
              { label: '+ Add Purchase', onClick: () => navigate('/purchases'), color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' },
              { label: '+ Add Party', onClick: () => navigate('/parties'), color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20' },
              { label: 'View Reports', onClick: () => navigate('/reports'), color: 'bg-violet-50 hover:bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:hover:bg-violet-500/20 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20' },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors ${btn.color}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent transactions */}
      {report.top_items.length > 0 && (
        <Card title="Today at a Glance">
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <div className="flex justify-between"><span>Total Sales</span><span className="font-medium text-gray-900 dark:text-white">{formatCurrency(report.total_sales)}</span></div>
            <div className="flex justify-between"><span>Total Purchases</span><span className="font-medium text-gray-900 dark:text-white">{formatCurrency(report.total_purchases)}</span></div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 mt-2"><span className="font-medium">Gross Profit</span><span className={`font-bold ${Number(report.gross_profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(report.gross_profit)}</span></div>
          </div>
        </Card>
      )}
    </div>
  )
}
