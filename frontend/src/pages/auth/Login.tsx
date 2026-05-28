import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { login } from '../../api/auth'
import { useAuthStore } from '../../stores/authStore'
import Input from '../../components/ui/Input'
import { Leaf, BarChart2, FileText, Wallet, BookOpen } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

const features = [
  { icon: FileText,  label: 'GST Invoices',    desc: 'Auto CGST/SGST/IGST, shareable PDF' },
  { icon: BarChart2, label: 'Daily Reports',    desc: 'Sales, purchases, profit at a glance' },
  { icon: Wallet,    label: 'Cash in Hand',     desc: 'Track every rupee in your cashbook' },
  { icon: Leaf,      label: 'Party Ledger',     desc: 'Know exactly who owes what' },
]

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const res = await login(data.email, data.password)
      localStorage.setItem('access_token', res.access_token)
      setUser(res.user)
      toast.success(`Welcome back, ${res.user.full_name}!`)
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(145deg, #14532d 0%, #166534 40%, #15803d 70%, #059669 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #bbf7d0, transparent)' }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #a7f3d0, transparent)' }} />
        <div className="absolute top-1/2 right-8 w-48 h-48 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #fde68a, transparent)' }} />

        {/* Wheat SVG watermark */}
        <svg className="absolute bottom-0 right-0 w-72 h-72 opacity-5" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="100" cy="180" rx="8" ry="180" fill="white" />
          {[40,60,80,100,120,140,160].map((y, i) => (
            <ellipse key={i} cx={100 + (i % 2 === 0 ? 28 : -28)} cy={y} rx="22" ry="12" fill="white" transform={`rotate(${i % 2 === 0 ? -30 : 30} ${100 + (i % 2 === 0 ? 28 : -28)} ${y})`} />
          ))}
        </svg>

        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Artha</span>
          </div>
          <p className="text-green-200 text-sm ml-14">Smart GST accounting for businesses</p>
        </div>

        {/* Main copy */}
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span className="text-green-100 text-xs font-medium">Built for Azadpur, Ghazipur & mandis across India</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-3">
            Your digital<br />
            <span className="text-emerald-300">mandi accountant</span>
          </h2>
          <p className="text-green-200 text-base leading-relaxed max-w-sm">
            Replace kaccha hisaab with proper GST invoices, real-time party ledgers, and daily profit reports.
          </p>
        </div>

        {/* Feature list */}
        <div className="grid grid-cols-2 gap-3">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white/8 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-emerald-400/20 flex items-center justify-center mb-2">
                <Icon className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="text-white text-sm font-semibold">{label}</div>
              <div className="text-green-300 text-xs mt-0.5 leading-snug">{desc}</div>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <p className="text-green-400 text-xs">GST-Ready · Offline First · ₹199/quarter onwards</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-50/40">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-green-600 flex items-center justify-center mb-3 shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Artha</h1>
            <p className="text-gray-500 text-sm mt-1">Smart GST accounting for businesses</p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
              <p className="text-gray-400 text-sm mt-1">Sign in to your Artha account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                required
                {...register('email')}
                error={errors.email?.message}
              />
              <Input
                label="Password"
                type="password"
                showToggle
                placeholder="••••••••"
                required
                {...register('password')}
                error={errors.password?.message}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-semibold text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-green-200 mt-2 flex items-center justify-center gap-2"
              >
                {isLoading && (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                Sign in
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-green-600 hover:text-green-500 font-semibold">Create one free</Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            Trusted by vendors at Azadpur, Ghazipur & mandis across India
          </p>
        </div>
      </div>
    </div>
  )
}
