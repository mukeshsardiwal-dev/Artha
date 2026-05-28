import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSubscriptionPlans,
  activateSubscription,
  type CreateOrderPayload,
} from '../api/business'
import { useAuthStore } from '../stores/authStore'
import { INDIAN_STATES } from '../lib/constants'
import Input from './ui/Input'
import Select from './ui/Select'
import Spinner from './ui/Spinner'
import toast from 'react-hot-toast'
import { CheckCircle2, Zap, BookOpen } from 'lucide-react'

interface Props {
  mode: 'setup' | 'renew'
}

const stateOptions = INDIAN_STATES.map(s => ({ value: s, label: s }))

const PLAN_HIGHLIGHTS: Record<string, string[]> = {
  '3m':  ['All features included', 'GST invoices & PDF', 'Unlimited entries', 'Email support'],
  '6m':  ['All features included', 'GST invoices & PDF', 'Unlimited entries', 'Priority support', 'Save 12%'],
  '12m': ['All features included', 'GST invoices & PDF', 'Unlimited entries', 'Priority support', '3 device logins', 'Save 25%'],
}

export default function SubscriptionModal({ mode }: Props) {
  const qc = useQueryClient()
  const { setBusiness } = useAuthStore()

  const [step, setStep] = useState<'profile' | 'plan'>(mode === 'renew' ? 'plan' : 'profile')
  const [selectedPlan, setSelectedPlan] = useState('12m')
  const [form, setForm] = useState({ name: '', state: '', address: '', gstin: '', phone: '' })

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: getSubscriptionPlans,
  })

  const activateMut = useMutation({
    mutationFn: activateSubscription,
    onSuccess: (biz) => {
      setBusiness(biz)
      qc.invalidateQueries({ queryKey: ['business'] })
      toast.success('Subscription activated! Welcome to Artha.')
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to activate. Please try again.'),
  })

  const f = (field: string, val: string) => setForm(prev => ({ ...prev, [field]: val }))

  const handleProfileNext = () => {
    if (!form.name.trim()) { toast.error('Business name is required'); return }
    if (!form.state) { toast.error('Please select your state'); return }
    setStep('plan')
  }

  const handleActivate = () => {
    const payload: CreateOrderPayload = {
      plan: selectedPlan,
      ...(mode === 'setup' ? form : {}),
    }
    activateMut.mutate(payload)
  }

  const chosenPlan = plans?.find(p => p.plan === selectedPlan)

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-green-700 px-6 py-5 flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-white" />
          <div>
            <div className="text-white font-bold text-lg leading-tight">Artha</div>
            <div className="text-green-200 text-xs">
              {mode === 'setup' ? 'Get started — set up your account' : 'Your subscription has expired — renew to continue'}
            </div>
          </div>
        </div>

        {/* Step tabs — only for setup */}
        {mode === 'setup' && (
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {(['profile', 'plan'] as const).map((s, i) => (
              <div
                key={s}
                className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                  step === s
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-400'
                }`}
              >
                {i + 1}. {s === 'profile' ? 'Business Details' : 'Choose Plan'}
              </div>
            ))}
          </div>
        )}

        <div className="p-6">
          {/* Step 1 — business profile */}
          {step === 'profile' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tell us about your business so we can personalise your invoices and reports.
              </p>
              <Input label="Business Name" value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Sharma Fruits & Veg" required />
              <div className="grid grid-cols-2 gap-4">
                <Select label="State" value={form.state} onChange={e => f('state', e.target.value)} placeholder="— Select state —" options={stateOptions} required />
                <Input label="Phone" value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="GSTIN (optional)" value={form.gstin} onChange={e => f('gstin', e.target.value)} placeholder="07ABCDE1234F1Z5" />
                <Input label="Address (optional)" value={form.address} onChange={e => f('address', e.target.value)} placeholder="Azadpur Mandi, Delhi" />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleProfileNext}
                  className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors"
                >
                  Next → Choose Plan
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — plan selection */}
          {step === 'plan' && (
            <div className="space-y-5">
              {plansLoading ? (
                <div className="flex justify-center py-10"><Spinner className="w-7 h-7" /></div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose a plan. All plans include every feature — no hidden charges.
                  </p>

                  {/* Plan cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {plans?.map(plan => {
                      const isSelected = selectedPlan === plan.plan
                      const isPopular = plan.plan === '12m'
                      return (
                        <button
                          key={plan.plan}
                          onClick={() => setSelectedPlan(plan.plan)}
                          className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                            isSelected
                              ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                          }`}
                        >
                          {isPopular && (
                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                              BEST VALUE
                            </span>
                          )}
                          {plan.savings && (
                            <span className="absolute -top-2.5 right-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {plan.savings}
                            </span>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{plan.label}</div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">{plan.amount_display}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{plan.per_month}</div>
                          {isSelected && (
                            <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-green-600" />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Highlights */}
                  {chosenPlan && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        What's included — {chosenPlan.label}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {PLAN_HIGHLIGHTS[chosenPlan.plan]?.map(h => (
                          <div key={h} className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            {h}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    {mode === 'setup' && (
                      <button onClick={() => setStep('profile')} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        ← Back
                      </button>
                    )}
                    <button
                      onClick={handleActivate}
                      disabled={activateMut.isPending}
                      className="ml-auto flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors"
                    >
                      {activateMut.isPending
                        ? <Spinner className="w-4 h-4" />
                        : <Zap className="w-4 h-4" />
                      }
                      Activate {chosenPlan?.label} Plan — {chosenPlan?.amount_display}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
