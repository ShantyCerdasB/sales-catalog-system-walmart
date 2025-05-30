import DataTable from '../../components/ui/Table'
import { useUsers, type User } from '../../hooks/userUsers'

export default function UsersListPage() {
  const { data: users = [], isLoading, error } = useUsers()

  if (isLoading) return <div className="p-4">Cargando usuarios…</div>
  if (error)     return <div className="p-4 text-red-600">Error: {error.message}</div>

  return (
    <div>
      <DataTable<User>
        columns={['username', 'email', 'passwordHash', 'roles']}
        items={users}
        onAdd={() => {}}
        onEdit={() => {}}
        onDelete={async () => {}}
        pageSize={10}
      />
    </div>
  )
}
