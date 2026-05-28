import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBusiness, createBusiness, updateBusiness, uploadBusinessLogo, deleteBusinessLogo } from '../api/business'
import { updateProfile, changePassword } from '../api/auth'
import { useAuthStore } from '../stores/authStore'
import { INDIAN_STATES } from '../lib/constants'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import toast from 'react-hot-toast'
import { Building2, User, Shield, ImagePlus, Trash2, HeadphonesIcon, Mail, Phone, ZoomIn, X, Pencil, KeyRound } from 'lucide-react'
import type { Business } from '../types'

const stateOptions = INDIAN_STATES.map(s => ({ value: s, label: s }))

const emptyForm = () => ({
  name: '',
  address: '',
  state: '',
  gstin: '',
  phone: '',
})

export default function Settings() {
  const qc = useQueryClient()
  const { user, business } = useAuthStore()
  const [form, setForm] = useState(emptyForm())
  const [bizModal, setBizModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [accountModal, setAccountModal] = useState(false)
  const [accountTab, setAccountTab] = useState<'profile' | 'password'>('profile')
  const [profileForm, setProfileForm] = useState({ full_name: '', email: '', phone: '' })
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' })

  const { data: biz, isLoading } = useQuery({
    queryKey: ['business'],
    queryFn: getBusiness,
    retry: false,
  })

  useEffect(() => {
    if (biz) {
      setForm({
        name: biz.name || '',
        address: biz.address || '',
        state: biz.state || '',
        gstin: biz.gstin || '',
        phone: biz.phone || '',
      })
    }
  }, [biz])

  const logoUploadMut = useMutation({
    mutationFn: (file: File) => uploadBusinessLogo(file),
    onSuccess: (updated) => {
      toast.success('Logo updated')
      qc.invalidateQueries({ queryKey: ['business'] })
      useAuthStore.getState().setBusiness(updated)
      setLogoPreview(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to upload logo'),
  })

  const logoDeleteMut = useMutation({
    mutationFn: deleteBusinessLogo,
    onSuccess: (updated) => {
      toast.success('Logo removed')
      qc.invalidateQueries({ queryKey: ['business'] })
      useAuthStore.getState().setBusiness(updated)
    },
    onError: () => toast.error('Failed to remove logo'),
  })

  const updateProfileMut = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      useAuthStore.getState().setUser(updated)
      toast.success('Account details updated')
      setAccountModal(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to update'),
  })

  const changePasswordMut = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully')
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      setAccountModal(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to change password'),
  })

  const openAccountModal = () => {
    setProfileForm({ full_name: user?.full_name || '', email: user?.email || '', phone: user?.phone || '' })
    setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
    setAccountTab('profile')
    setAccountModal(true)
  }

  const handleProfileSave = () => {
    if (!profileForm.full_name.trim()) { toast.error('Name is required'); return }
    if (!profileForm.email.trim()) { toast.error('Email is required'); return }
    updateProfileMut.mutate({ full_name: profileForm.full_name, email: profileForm.email, phone: profileForm.phone })
  }

  const handlePasswordSave = () => {
    if (!passwordForm.current_password) { toast.error('Enter your current password'); return }
    if (passwordForm.new_password.length < 6) { toast.error('New password must be at least 6 characters'); return }
    if (passwordForm.new_password !== passwordForm.confirm_password) { toast.error('Passwords do not match'); return }
    changePasswordMut.mutate({ current_password: passwordForm.current_password, new_password: passwordForm.new_password })
  }

  const saveMut = useMutation({
    mutationFn: (data: Partial<Business>) => biz ? updateBusiness(data) : createBusiness(data),
    onSuccess: (updated) => {
      toast.success(biz ? 'Business profile updated' : 'Business profile created')
      qc.invalidateQueries({ queryKey: ['business'] })
      useAuthStore.getState().setBusiness(updated)
      setBizModal(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to save'),
  })

  const openBizModal = () => {
    setForm({
      name: biz?.name || '',
      address: biz?.address || '',
      state: biz?.state || '',
      gstin: biz?.gstin || '',
      phone: biz?.phone || '',
    })
    setBizModal(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Business name is required'); return }
    if (!form.state) { toast.error('State is required'); return }
    saveMut.mutate(form)
  }

  const f = (field: string, val: string) => setForm(prev => ({ ...prev, [field]: val }))

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be smaller than 2 MB'); return }
    setLogoPreview(URL.createObjectURL(file))
    logoUploadMut.mutate(file)
  }

  const subscriptionBadge = (status?: string) => {
    if (status === 'active') return 'success'
    if (status === 'trial') return 'warning'
    return 'danger'
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Business Profile */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Business Profile</h3>
          </div>
          {!isLoading && (
            <Button size="sm" variant="secondary" onClick={openBizModal}>
              <Pencil className="w-3.5 h-3.5" /> {biz ? 'Edit' : 'Set up'}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner className="w-7 h-7" /></div>
        ) : (
          <div className="space-y-5">
            {/* Logo — centred, always visible */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {logoPreview || biz?.logo_url ? (
                    <img src={logoPreview || biz!.logo_url!} alt="Company logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                {(logoPreview || biz?.logo_url) && (
                  <div
                    className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    onClick={() => setLightboxOpen(true)}
                  >
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} isLoading={logoUploadMut.isPending}>
                  <ImagePlus className="w-3.5 h-3.5" /> {biz?.logo_url ? 'Change Logo' : 'Upload Logo'}
                </Button>
                {biz?.logo_url && (
                  <Button size="sm" variant="danger" onClick={() => logoDeleteMut.mutate()} isLoading={logoDeleteMut.isPending}>
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </Button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" className="hidden" onChange={handleLogoChange} />
            </div>

            {/* Read-only business details */}
            {biz ? (
              <div className="space-y-0 text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
                {[
                  { label: 'Business Name', value: biz.name },
                  { label: 'State',         value: biz.state },
                  { label: 'Phone',         value: biz.phone },
                  { label: 'GSTIN',         value: biz.gstin },
                  { label: 'Address',       value: biz.address },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2.5">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900 dark:text-white text-right max-w-[60%] truncate">
                      {value || <span className="text-gray-400 font-normal">Not set</span>}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center text-gray-400 py-4">
                No business profile yet. Click <strong>Set up</strong> to get started.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Business Edit Modal */}
      <Modal isOpen={bizModal} onClose={() => setBizModal(false)} title={biz ? 'Edit Business Profile' : 'Set Up Business'}>
        <div className="space-y-4">
          <Input label="Business Name" value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Sharma Traders" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="+91 98765 43210" />
            <Input label="GSTIN" value={form.gstin} onChange={e => f('gstin', e.target.value)} placeholder="07ABCDE1234F1Z5" />
          </div>
          <Select label="State" value={form.state} onChange={e => f('state', e.target.value)} placeholder="— Select your state —" options={stateOptions} required />
          <Input label="Address" value={form.address} onChange={e => f('address', e.target.value)} placeholder="Shop No. 12, Azadpur Mandi, Delhi" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setBizModal(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={saveMut.isPending}>{biz ? 'Save Changes' : 'Create Business'}</Button>
          </div>
        </div>
      </Modal>

      {/* Lightbox */}
      {lightboxOpen && (logoPreview || biz?.logo_url) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors" onClick={() => setLightboxOpen(false)}>
            <X className="w-5 h-5" />
          </button>
          <img src={logoPreview || biz!.logo_url!} alt="Company logo" className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" style={{ maxWidth: '480px', maxHeight: '480px' }} onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Account Info */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Account</h3>
          </div>
          <Button size="sm" variant="secondary" onClick={openAccountModal}>
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Button>
        </div>
        <div className="space-y-0 text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
          <div className="flex justify-between items-center py-2.5">
            <span className="text-gray-500">Full Name</span>
            <span className="font-medium text-gray-900 dark:text-white">{user?.full_name}</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-900 dark:text-white">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-gray-500">Phone</span>
            <span className="font-medium text-gray-900 dark:text-white">{user?.phone || <span className="text-gray-400">Not set</span>}</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-gray-500">Password</span>
            <button
              onClick={() => { openAccountModal(); setAccountTab('password') }}
              className="text-xs text-green-600 hover:text-green-500 font-medium flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5" /> Change password
            </button>
          </div>
        </div>
      </Card>

      {/* Account Edit Modal */}
      <Modal isOpen={accountModal} onClose={() => setAccountModal(false)} title="Edit Account">
        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-5">
          {(['profile', 'password'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setAccountTab(tab)}
              className={`flex-1 py-2 text-sm font-medium transition-colors capitalize ${
                accountTab === tab
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab === 'profile' ? 'Profile Details' : 'Change Password'}
            </button>
          ))}
        </div>

        {accountTab === 'profile' && (
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={profileForm.full_name}
              onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))}
              placeholder="Your full name"
              required
            />
            <Input
              label="Email"
              type="email"
              value={profileForm.email}
              onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Phone"
              type="tel"
              value={profileForm.phone}
              onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="+91 98765 43210"
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setAccountModal(false)}>Cancel</Button>
              <Button onClick={handleProfileSave} isLoading={updateProfileMut.isPending}>Save Changes</Button>
            </div>
          </div>
        )}

        {accountTab === 'password' && (
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              showToggle
              value={passwordForm.current_password}
              onChange={e => setPasswordForm(p => ({ ...p, current_password: e.target.value }))}
              placeholder="••••••••"
              required
            />
            <Input
              label="New Password"
              type="password"
              showToggle
              value={passwordForm.new_password}
              onChange={e => setPasswordForm(p => ({ ...p, new_password: e.target.value }))}
              placeholder="Min. 6 characters"
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              showToggle
              value={passwordForm.confirm_password}
              onChange={e => setPasswordForm(p => ({ ...p, confirm_password: e.target.value }))}
              placeholder="••••••••"
              required
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setAccountModal(false)}>Cancel</Button>
              <Button onClick={handlePasswordSave} isLoading={changePasswordMut.isPending}>Change Password</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Subscription */}
      {biz && (
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Subscription</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant={subscriptionBadge(biz.subscription_status)}>
                {biz.subscription_status === 'active' ? 'Active' : biz.subscription_status === 'pending' ? 'Not Subscribed' : 'Expired'}
              </Badge>
              {biz.subscription_plan && (
                <span className="text-sm text-gray-500">
                  {{ '3m': '3 Month Plan', '6m': '6 Month Plan', '12m': '12 Month Plan' }[biz.subscription_plan] ?? biz.subscription_plan}
                </span>
              )}
            </div>
            {biz.subscription_status === 'active' && biz.subscription_ends_at && (
              <p className="text-sm text-gray-500">
                Valid until:{' '}
                <strong className="text-gray-900 dark:text-white">
                  {new Date(biz.subscription_ends_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </strong>
              </p>
            )}
            {(biz.subscription_status === 'expired' || biz.subscription_status === 'pending') && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-sm text-red-600 dark:text-red-400">
                {biz.subscription_status === 'expired'
                  ? 'Your subscription has expired. Renew to continue using the app.'
                  : 'No active subscription. Subscribe to start using Artha.'}
              </div>
            )}

            {/* Plan summary */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { plan: '3m', label: '3 Months', price: '₹199' },
                { plan: '6m', label: '6 Months', price: '₹349' },
                { plan: '12m', label: '12 Months', price: '₹599', badge: 'Best Value' },
              ].map(p => (
                <div
                  key={p.plan}
                  className={`relative rounded-xl border p-3 text-center ${biz.subscription_plan === p.plan && biz.subscription_status === 'active' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700'}`}
                >
                  {p.badge && <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">{p.badge}</span>}
                  <div className="text-xs text-gray-400">{p.label}</div>
                  <div className="font-bold text-gray-900 dark:text-white">{p.price}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Support */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
            <HeadphonesIcon className="w-5 h-5 text-sky-500" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Support</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Having trouble? Reach out to us — we're here to help.
        </p>
        <div className="space-y-3">
          <a
            href="mailto:support@artha.in"
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <div className="text-xs text-gray-400 leading-none mb-0.5">Email</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                support@artha.in
              </div>
            </div>
          </a>
          <a
            href="tel:+918800123456"
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <div className="text-xs text-gray-400 leading-none mb-0.5">Phone</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                +91 88001 23456
              </div>
            </div>
          </a>
        </div>
        <p className="text-xs text-gray-400 mt-4">Mon – Sat · 9 AM to 6 PM IST</p>
      </Card>
    </div>
  )
}
