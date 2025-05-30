import  { useState } from 'react'
import DataTable from '../../components/ui/Table'
import CrudModal, { type Field } from '../../components/ui/CrudModal'
import Toast from '../../components/ui/Toast'
import { useProducts, type Product } from '../../hooks/useProducts'
import apiClient from '../../api/apiClient'

/**
 * Field definitions for the product form.
 */
const productFields: Field<Product>[] = [
  { name: 'code',        label: 'Code',        type: 'text',   required: true },
  { name: 'name',        label: 'Name',        type: 'text',   required: true },
  { name: 'description', label: 'Description', type: 'text' },
  { name: 'price',       label: 'Price',       type: 'number', required: true },
  {
    name: 'unit',
    label: 'Unit',
    type: 'select',
    required: true,
    options: [
      { value: 'unit',  label: 'Unit' },
      { value: 'kg',    label: 'Kg' },
      { value: 'liter', label: 'Liter' },
    ],
  },
]

export default function ProductsListPage() {
  const { data: products = [], isLoading, error, refetch } = useProducts()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState<Partial<Product> | null>(null)
  const [toast, setToast]         = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSave(data: Partial<Product>) {
    try {
      if (data.id) {
        // update existing product
        await apiClient.patch(`/products/${data.id}`, {
          code:        data.code,
          name:        data.name,
          description: data.description,
          price:       data.price,
          unit:        data.unit,
        })
        setToast({ type: 'success', text: 'Product updated.' })
      } else {
        // create new product
        await apiClient.post(`/products`, {
          code:        data.code,
          name:        data.name,
          description: data.description,
          price:       data.price,
          unit:        data.unit,
        })
        setToast({ type: 'success', text: 'Product created.' })
      }
      setModalOpen(false)
      refetch()
    } catch (err: any) {
      setToast({ type: 'error', text: err?.response?.data?.message || 'Save failed' })
    }
  }

  if (isLoading) return <div className="p-4">Loading products…</div>
  if (error)     return <div className="p-4 text-red-600">Error: {error.message}</div>

  return (
    <div>
      <DataTable<Product>
        columns={['code','name','description','price','unit']}
        items={products}
        onAdd={() => {
          setEditing(null)
          setModalOpen(true)
        }}
        onEdit={p => {
          setEditing(p)
          setModalOpen(true)
        }}
        onDelete={async p => {
          await apiClient.delete(`/products/${p.id}`)
          refetch()
        }}
        pageSize={10}
      />

      <CrudModal<Product>
        isOpen={modalOpen}
        title={editing?.id ? 'Edit Product' : 'Create Product'}
        fields={productFields}
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
