import { useState, useEffect } from 'react'
import DataTable from '../../components/ui/Table'
import CrudModal, { type Field } from '../../components/ui/CrudModal'
import Toast from '../../components/ui/Toast'
import { useDiscounts, type Discount } from '../../hooks/useDiscount'
import { useProducts } from '../../hooks/useProducts'
import apiClient from '../../api/apiClient'

const discountFields: Field<Discount>[] = [
  { name: 'productId', label: 'Product', type: 'select', required: true },
  { name: 'code',       label: 'Code',    type: 'text',   required: true },
  { name: 'percentage', label: 'Percent', type: 'number', required: true },
  { name: 'validFrom',  label: 'Valid From (ISO)', type: 'text', required: true },
  { name: 'validTo',    label: 'Valid To (ISO)',   type: 'text' },
  {
    name: 'isActive',
    label: 'Active',
    type: 'select',
    options: [
      { value: 'true',  label: 'Active' },
      { value: 'false', label: 'Inactive' },
    ],
  },
]

export default function DiscountsListPage() {
  const { data: discounts = [], isLoading, error, refetch } = useDiscounts()
  const { data: products = [] } = useProducts()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState<Partial<Discount> | null>(null)
  const [toast, setToast]         = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const prodOpts = products.map(p => ({ value: p.id, label: p.name }))
    discountFields.find(f => f.name === 'productId')!.options = prodOpts
  }, [products])

  async function handleSave(data: Partial<Discount>) {
    // coerce isActive into a boolean
    const isActiveBool =
      typeof data.isActive === 'string'
        ? data.isActive === 'true'
        : Boolean(data.isActive)

    try {
      if (data.id) {
        // update existing discount
        await apiClient.patch(`/discounts/${data.id}`, {
          code: data.code,
          percentage: data.percentage,
          validFrom: data.validFrom,
          validTo: data.validTo,
          isActive: isActiveBool,
          productId: data.productId,
        })
        setToast({ type: 'success', text: 'Discount updated.' })
      } else {
        // create new discount
        await apiClient.post(`/discounts`, {
          code: data.code,
          percentage: data.percentage,
          validFrom: data.validFrom,
          validTo: data.validTo,
          isActive: isActiveBool,
          productId: data.productId,
        })
        setToast({ type: 'success', text: 'Discount created.' })
      }

      setModalOpen(false)
      refetch()
    } catch (err: any) {
      setToast({ type: 'error', text: err?.response?.data?.message || 'Save failed' })
    }
  }

  if (isLoading) return <div className="p-4">Loading discounts…</div>
  if (error)     return <div className="p-4 text-red-600">Error: {error.message}</div>

  return (
    <div>
      <DataTable<Discount>
        columns={['productId','code','percentage','validFrom','validTo','isActive']}
        items={discounts}
        onAdd={() => { setEditing(null); setModalOpen(true) }}
        onEdit={d => { setEditing(d); setModalOpen(true) }}
        onDelete={async d => {
          await apiClient.delete(`/discounts/${d.id}`)
          refetch()
        }}
        pageSize={10}
      />

      <CrudModal<Discount>
        isOpen={modalOpen}
        title={editing?.id ? 'Edit Discount' : 'Create Discount'}
        fields={discountFields}
        initial={editing || undefined}
        onSubmit={handleSave}
        onClose={() => setModalOpen(false)}
      />

      {toast && (
        <Toast type={toast.type} message={toast.text} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
