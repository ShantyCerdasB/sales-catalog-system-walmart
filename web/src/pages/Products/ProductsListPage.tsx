import { useState } from 'react'
import DataTable from '../../components/ui/Table'
import CrudModal, { type Field } from '../../components/ui/CrudModal'
import Toast from '../../components/ui/Toast'
import { useProducts, type Product } from '../../hooks/useProducts'
import apiClient from '../../api/apiClient'

type ProductRow = Product & { discountPercentage: number }

export default function ProductsListPage() {
  const { data: products = [], isLoading, error, refetch } = useProducts()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Product> | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const createFields: Field<Product>[] = [
    { name: 'code', label: 'Code', type: 'text', required: true },
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'price', label: 'Price', type: 'number', required: true },
    {
      name: 'unit',
      label: 'Unit',
      type: 'select',
      required: true,
      options: [
        { value: 'unit', label: 'Unit' },
        { value: 'kg', label: 'Kg' },
        { value: 'liter', label: 'Liter' },
      ],
    },
  ]

  const editFields: Field<Product>[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'price', label: 'Price', type: 'number', required: true },
    {
      name: 'unit',
      label: 'Unit',
      type: 'select',
      required: true,
      options: [
        { value: 'unit', label: 'Unit' },
        { value: 'kg', label: 'Kg' },
        { value: 'liter', label: 'Liter' },
      ],
    },
  ]
async function handleSave(data: Partial<Product>) {
  const payload = {
    code:        data.code,
    name:        data.name,
    description: data.description,
    price:       typeof data.price === 'number' ? data.price : Number(data.price),
    unit:        data.unit,
  }

  try {
    if (data.id) {
      await apiClient.patch(`/products/${data.id}`, payload)
      setToast({ type: 'success', text: 'Product updated.' })
    } else {
      await apiClient.post(`/products`, payload)
      setToast({ type: 'success', text: 'Product created.' })
    }
    setModalOpen(false)
    refetch()
  } catch (err: any) {
    const apiErr = err.response?.data
    if (apiErr?.type === 'validation' && apiErr.issues?.fieldErrors) {
      const firstField = Object.keys(apiErr.issues.fieldErrors)[0]
      const msg = apiErr.issues.fieldErrors[firstField][0]
      setToast({ type: 'error', text: msg })
    } else {
      setToast({ type: 'error', text: err.response?.statusText || 'Save failed' })
    }
  }
}


  if (isLoading) return <div className="p-4">Loading products…</div>
  if (error) return <div className="p-4 text-red-600">Error: {error.message}</div>

  return (
    <div>
      <DataTable<ProductRow>
        columns={[
          'id',
          'code',
          'name',
          'description',
          'price',
          'unit',
          'isDeleted',
          'createdAt',
          'updatedAt',
          'discountPercentage',
        ]}
        items={products.map(p => ({
          ...p,
          discountPercentage: p.discount?.percentage ?? 0,
        }))}
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
        fields={editing ? editFields : createFields}
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
