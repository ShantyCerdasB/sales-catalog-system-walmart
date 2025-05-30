import { useState } from 'react'
import DataTable from '../../components/ui/Table'
import CrudModal, { type Field } from '../../components/ui/CrudModal'
import Toast from '../../components/ui/Toast'
import { useClients } from '../../hooks/useClients'
import apiClient from '../../api/apiClient'

interface Client {
  id: string
  code: string
  name: string
  nit: string
  email?: string
  phone?: string
}

const clientFields: Field<Client>[] = [
  { name: 'code', label: 'Code', type: 'text', required: true },
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'nit',  label: 'NIT',  type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'text' },
]

export default function ClientsListPage() {
  const { data: clients = [], isLoading, error, refetch } = useClients()

  const [modalOpen, setModalOpen]         = useState(false)
  const [editing, setEditing]             = useState<Partial<Client> | null>(null)
  const [toast, setToast]                 = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSave(data: Partial<Client>) {
    try {
      if (data.id) {
        // update
        await apiClient.patch(`/clients/${data.id}`, data)
        setToast({ type: 'success', text: 'Client updated.' })
      } else {
        // create
        await apiClient.post(`/clients`, data)
        setToast({ type: 'success', text: 'Client created.' })
      }
      setModalOpen(false)
      refetch()
    } catch (err: any) {
      setToast({ type: 'error', text: err?.response?.data?.message || 'Save failed' })
    }
  }

  if (isLoading) return <div className="p-4">Loading...</div>
  if (error)     return <div className="p-4 text-red-600">Error: {error.message}</div>

  return (
    <div>
      <DataTable<Client>
        columns={['code', 'name', 'nit', 'email', 'phone']}
        items={clients}
        onAdd={() => {
          setEditing(null)
          setModalOpen(true)
        }}
        onEdit={(c) => {
          setEditing(c)
          setModalOpen(true)
        }}
        onDelete={async (c) => {
          await apiClient.delete(`/clients/${c.id}`)
          refetch()
        }}
        pageSize={10}
      />

      <CrudModal<Client>
        isOpen={modalOpen}
        title={editing?.id ? 'Edit Client' : 'Create New Client'}
        fields={clientFields}
        initial={editing || undefined}
        onSubmit={handleSave}
        onClose={() => setModalOpen(false)}
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
