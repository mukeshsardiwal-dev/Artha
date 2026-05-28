import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getItems, createItem, updateItem, deleteItem } from '../api/items'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { GST_RATES, UNITS, ITEM_CATEGORIES } from '../lib/constants'
import { cn } from '../lib/utils'
import type { Item } from '../types'

const gstOptions = GST_RATES.map(r => ({ value: r, label: r === 0 ? 'Exempt (0%)' : `${r}%` }))
const unitOptions = UNITS.map(u => ({ value: u, label: u }))
const categoryOptions = ITEM_CATEGORIES.map(c => ({ value: c, label: c }))

const CATEGORY_COLORS: Record<string, string> = {
  'Fruits':          'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',
  'Vegetables':      'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  'Grains & Pulses': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400',
  'Spices':          'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  'Dry Fruits':      'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  'Dairy':           'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  'Oils & Fats':     'bg-lime-100 text-lime-700 dark:bg-lime-500/15 dark:text-lime-400',
  'Herbs':           'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  'Flowers':         'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400',
  'Others':          'bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-400',
}

export default function Items() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Item | null>(null)
  const [form, setForm] = useState({ name: '', category: '', unit: 'kg', hsn_code: '', gst_rate: '5' })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: items, isLoading } = useQuery({
    queryKey: ['items', search],
    queryFn: () => getItems({ search: search || undefined }),
  })

  const filtered = filterCategory
    ? items?.filter(i => i.category === filterCategory)
    : items

  const createMut = useMutation({
    mutationFn: createItem,
    onSuccess: () => { toast.success('Item added'); qc.invalidateQueries({ queryKey: ['items'] }); closeModal() },
    onError: () => toast.error('Failed to add item'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => updateItem(id, data),
    onSuccess: () => { toast.success('Updated'); qc.invalidateQueries({ queryKey: ['items'] }); closeModal() },
    onError: () => toast.error('Failed to update'),
  })
  const deleteMut = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['items'] }) },
    onError: () => toast.error('Failed to delete'),
  })

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', category: '', unit: 'kg', hsn_code: '', gst_rate: '5' })
    setModalOpen(true)
  }
  const openEdit = (item: Item) => {
    setEditing(item)
    setForm({ name: item.name, category: item.category || '', unit: item.unit, hsn_code: item.hsn_code || '', gst_rate: String(item.gst_rate) })
    setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    const data = { ...form, gst_rate: parseFloat(form.gst_rate), category: form.category || undefined }
    if (editing) updateMut.mutate({ id: editing.id, data })
    else createMut.mutate(data)
  }

  const f = (field: string, val: string) => setForm(prev => ({ ...prev, [field]: val }))

  const categoryCounts = ITEM_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = items?.filter(i => i.category === cat).length ?? 0
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-4">
      <Card>
        <div className="space-y-3">
          <div className="flex gap-3 items-end">
            <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
            <Button onClick={openAdd} className="ml-auto"><Plus className="w-4 h-4" /> Add Item</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory('')}
              className={cn('px-3 py-1 rounded-lg text-xs font-medium border transition-all',
                !filterCategory
                  ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30'
                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-green-300',
              )}
            >
              All {items ? `(${items.length})` : ''}
            </button>
            {ITEM_CATEGORIES.filter(c => categoryCounts[c] > 0).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat === filterCategory ? '' : cat)}
                className={cn('px-3 py-1 rounded-lg text-xs font-medium border transition-all',
                  filterCategory === cat
                    ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-green-300',
                )}
              >
                {cat} ({categoryCounts[cat]})
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner className="w-7 h-7" /></div>
        ) : !filtered?.length ? (
          <EmptyState
            title={filterCategory ? `No items in "${filterCategory}"` : 'No items'}
            description="Add your product catalogue with HSN codes and GST rates"
            action={<Button onClick={openAdd}><Plus className="w-4 h-4" />Add Item</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4">Unit</th>
                  <th className="pb-3 pr-4">HSN Code</th>
                  <th className="pb-3 pr-4">GST Rate</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                    <td className="py-3 pr-4">
                      {item.category ? (
                        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS['Others'])}>
                          {item.category}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{item.unit}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-gray-500">{item.hsn_code || '—'}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={item.gst_rate === 0 ? 'default' : 'success'}>{item.gst_rate}%</Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Item' : 'Add Item'}>
        <div className="space-y-4">
          <Input label="Item Name" value={form.name} onChange={e => f('name', e.target.value)} required placeholder="e.g. Mango (Dasheri)" />
          <Select label="Category" value={form.category} onChange={e => f('category', e.target.value)} placeholder="— Select category —" options={categoryOptions} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Unit" value={form.unit} onChange={e => f('unit', e.target.value)} options={unitOptions} />
            <Input label="HSN Code" value={form.hsn_code} onChange={e => f('hsn_code', e.target.value)} placeholder="e.g. 0804" />
          </div>
          <Select label="GST Rate" value={form.gst_rate} onChange={e => f('gst_rate', e.target.value)} options={gstOptions} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSave} isLoading={createMut.isPending || updateMut.isPending}>
              {editing ? 'Update' : 'Add Item'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Item"
        message="This item will be permanently removed from your catalogue. This cannot be undone."
        confirmLabel="Delete Item"
        loading={deleteMut.isPending}
        onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId, { onSettled: () => setDeleteId(null) }) }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
