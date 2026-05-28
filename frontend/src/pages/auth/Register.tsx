import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { register as apiRegister } from '../../api/auth'
import { useAuthStore } from '../../stores/authStore'
import Input from '../../components/ui/Input'
import { BookOpen, Sprout, ShieldCheck, Clock3, Headphones } from 'lucide-react'

const schema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Minimum 6 characters'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] })
type FormData = z.infer<typeof schema>

const perks = [
  { icon: Sprout,      text: 'Free to start — no credit card needed' },
  { icon: ShieldCheck, text: 'Your data is secure & backed up daily' },
  { icon: Clock3,      text: 'Set up in under 5 minutes' },
  { icon: Headphones,  text: 'Support in Hindi & English' },
]

export default function Register() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const res = await apiRegister({ email: data.email, password: data.password, full_name: data.full_name, phone: data.phone })
      localStorage.setItem('access_token', res.access_token)
      setUser(res.user)
      toast.success('Account created! Let\'s set up your business.')
      navigate('/settings')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(155deg, #052e16 0%, #14532d 35%, #166534 65%, #15803d 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #6ee7b7, transparent)' }} />
        <div className="absolute bottom-10 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #fde68a, transparent)' }} />

        {/* Leaf SVG watermark */}
        <svg className="absolute top-1/4 right-6 w-40 h-40 opacity-5" viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 5 C20 5, 5 30, 5 55 C5 80, 25 95, 50 95 C75 95, 95 80, 95 55 C95 30, 80 5, 50 5Z" />
          <line x1="50" y1="95" x2="50" y2="20" stroke="white" strokeWidth="2" />
          {[30,45,60,75].map((y, i) => (
            <line key={i} x1="50" y1={y} x2={50 + (i % 2 === 0 ? 25 : -25)} y2={y - 12} stroke="white" strokeWidth="1.5" />
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
          <p className="text-green-300 text-sm ml-14">Smart accounting for businesses</p>
        </div>

        {/* Main copy */}
        <div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-3">
            Start your free<br />
            <span className="text-emerald-300">mandi account</span>
          </h2>
          <p className="text-green-200 text-sm leading-relaxed max-w-xs">
            Join thousands of fruit & vegetable vendors who replaced paper notebooks with Artha.
          </p>
        </div>

        {/* Perks */}
        <div className="space-y-3">
          {perks.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <span className="text-green-100 text-sm">{text}</span>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '5,000+', label: 'Vendors' },
            { value: '₹50Cr+', label: 'Invoiced' },
            { value: '99.9%', label: 'Uptime' },
          ].map(s => (
            <div key={s.label} className="bg-white/8 rounded-2xl p-3 text-center border border-white/10">
              <div className="text-white font-bold text-base">{s.value}</div>
              <div className="text-green-400 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-50/40 overflow-y-auto">
        <div className="w-full max-w-md py-6">
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
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h2>
              <p className="text-gray-400 text-sm mt-1">Get started with Artha for free</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Sharma Ji"
                required
                {...register('full_name')}
                error={errors.full_name?.message}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  {...register('email')}
                  error={errors.email?.message}
                />
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  {...register('phone')}
                  error={errors.phone?.message}
                />
              </div>
              <Input
                label="Password"
                type="password"
                showToggle
                placeholder="Min. 6 characters"
                required
                {...register('password')}
                error={errors.password?.message}
              />
              <Input
                label="Confirm Password"
                type="password"
                showToggle
                placeholder="••••••••"
                required
                {...register('confirm_password')}
                error={errors.confirm_password?.message}
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
                Create Free Account
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 hover:text-green-500 font-semibold">Sign in</Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            By creating an account you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  )
}
