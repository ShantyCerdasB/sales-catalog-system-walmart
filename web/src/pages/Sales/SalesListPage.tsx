import React from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../components/ui/Table'
import Toast from '../../components/ui/Toast'
import { useSales, type Sale } from '../../hooks/useSales'
import apiClient from '../../api/apiClient'

export default function SalesListPage() {
  const navigate = useNavigate()
  const { data: sales = [], isLoading, error, refetch } = useSales()
  const [toast, setToast] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Cancel (soft) a sale
  async function handleCancel(sale: Sale) {
    try {
      await apiClient.patch(`/sales/${sale.id}/cancel`, { isCanceled: true })
      setToast({ type: 'success', text: 'Sale canceled.' })
      refetch()
    } catch (err: any) {
      setToast({ type: 'error', text: err?.response?.data?.message || 'Cancel failed' })
    }
  }

  if (isLoading) return <div className="p-4">Loading sales…</div>
  if (error)     return <div className="p-4 text-red-600">Error: {error.message}</div>

  return (
    <div>
      <DataTable<Sale>
        columns={[
          'id',
          'clientId',
          'date',
          'subtotal',
          'discountTotal',
          'total',
          'paymentMethod',
          'isCanceled',
        ]}
        items={sales}
        onAdd={() => navigate('/sales/create')}
        onEdit={(s) => navigate(`/sales/${s.id}`)}
        onDelete={handleCancel}
        pageSize={10}
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.text}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
