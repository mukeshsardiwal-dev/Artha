import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getParties, createParty, updateParty, deleteParty } from '../api/parties'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react'
import { INDIAN_STATES } from '../lib/constants'
import type { Party } from '../types'

const stateOptions = INDIAN_STATES.map(s => ({ value: s, label: s }))

export default function Parties() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'all' | 'customer' | 'supplier'>('all')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Party | null>(null)

  const [form, setForm] = useState<{ name: string; type: 'customer' | 'supplier'; phone: string; address: string; state: string; gstin: string }>({ name: '', type: 'customer', phone: '', address: '', state: '', gstin: '' })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: parties, isLoading } = useQuery({ queryKey: ['parties', tab, search], queryFn: () => getParties({ type: tab === 'all' ? undefined : tab, search: search || undefined }) })

  const createMut = useMutation({ mutationFn: createParty, onSuccess: () => { toast.success('Party added'); qc.invalidateQueries({ queryKey: ['parties'] }); closeModal() }, onError: () => toast.error('Failed to add party') })
  const updateMut = useMutation({ mutationFn: ({ id, data }: any) => updateParty(id, data), onSuccess: () => { toast.success('Updated'); qc.invalidateQueries({ queryKey: ['parties'] }); closeModal() }, onError: () => toast.error('Failed') })
  const deleteMut = useMutation({ mutationFn: deleteParty, onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['parties'] }) }, onError: () => toast.error('Failed') })

  const openAdd = () => { setEditing(null); setForm({ name: '', type: 'customer', phone: '', address: '', state: '', gstin: '' }); setModalOpen(true) }
  const openEdit = (p: Party) => { setEditing(p); setForm({ name: p.name, type: p.type as 'customer' | 'supplier', phone: p.phone || '', address: p.address || '', state: p.state || '', gstin: p.gstin || '' }); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (editing) updateMut.mutate({ id: editing.id, data: form })
    else createMut.mutate(form)
  }

  const f = (field: string, val: string) => setForm(prev => ({ ...prev, [field]: val }))

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {(['all', 'customer', 'supplier'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{t}</button>
            ))}
          </div>
          <Input placeholder="Search parties..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
          <Button onClick={openAdd} className="ml-auto"><Plus className="w-4 h-4" />Add Party</Button>
        </div>
      </Card>

      <Card>
        {isLoading ? <div className="flex justify-center py-12"><Spinner className="w-7 h-7" /></div>
          : !parties?.length ? <EmptyState title="No parties found" description="Add customers and suppliers" action={<Button onClick={openAdd}><Plus className="w-4 h-4" />Add Party</Button>} />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Name</th><th className="pb-3 pr-4">Type</th><th className="pb-3 pr-4">Phone</th>
                    <th className="pb-3 pr-4">State</th><th className="pb-3 pr-4">GSTIN</th><th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {parties.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">{p.name}</td>
                      <td className="py-3 pr-4"><Badge variant={p.type === 'customer' ? 'info' : 'default'}>{p.type}</Badge></td>
                      <td className="py-3 pr-4 text-gray-500">{p.phone || '—'}</td>
                      <td className="py-3 pr-4 text-gray-500">{p.state || '—'}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-gray-500">{p.gstin || '—'}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <button onClick={() => navigate(`/parties/${p.id}`)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500" title="View Ledger"><BookOpen className="w-4 h-4" /></button>
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500" title="Edit"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </Card>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Party' : 'Add Party'}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => f('name', e.target.value)} required placeholder="Ramesh Traders" />
          <Select label="Type" value={form.type} onChange={e => f('type', e.target.value)} options={[{ value: 'customer', label: 'Customer' }, { value: 'supplier', label: 'Supplier' }]} />
          <Input label="Phone" value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="+91 98765 43210" />
          <Input label="Address" value={form.address} onChange={e => f('address', e.target.value)} placeholder="Azadpur Mandi, Delhi" />
          <Select label="State" value={form.state} onChange={e => f('state', e.target.value)} placeholder="— Select state —" options={stateOptions} />
          <Input label="GSTIN" value={form.gstin} onChange={e => f('gstin', e.target.value)} placeholder="07ABCDE1234F1Z5" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSave} isLoading={createMut.isPending || updateMut.isPending}>{editing ? 'Update' : 'Add Party'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Party"
        message="This party and all associated data will be removed. This cannot be undone."
        confirmLabel="Delete Party"
        loading={deleteMut.isPending}
        onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId, { onSettled: () => setDeleteId(null) }) }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
