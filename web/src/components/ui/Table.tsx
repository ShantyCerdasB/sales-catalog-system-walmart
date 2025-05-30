import { useState, useMemo } from 'react'
import Modal from './Modal'
import Toast from './Toast'

interface DataTableProps<T extends Record<string, any>> {
  items: T[]
  onAdd: () => void
  onEdit: (item: T) => void
  onDelete: (item: T) => Promise<void> | void
  columns?: (keyof T)[]
  pageSize?: number
}

export default function DataTable<T extends { id: string }>({
  items,
  onAdd,
  onEdit,
  onDelete,
  columns,
  pageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [confirmItem, setConfirm] = useState<T | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const cols: (keyof T)[] = useMemo(
    () => columns ?? (items[0] ? (Object.keys(items[0]) as (keyof T)[]) : []),
    [columns, items]
  )

  const filtered = useMemo(() => {
    if (!search) return items
    const term = search.toLowerCase()
    return items.filter(item =>
      cols.some(col => {
        const v = item[col]
        return typeof v === 'string' && v.toLowerCase().includes(term)
      })
    )
  }, [items, cols, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize)

  function startDelete(item: T) {
    setConfirm(item)
  }

  function cancelDelete() {
    setConfirm(null)
  }

  async function confirmDelete() {
    if (!confirmItem) return
    try {
      await onDelete(confirmItem)
      setToast({ type: 'success', text: 'Deleted successfully.' })
    } catch {
      setToast({ type: 'error', text: 'Delete failed.' })
    } finally {
      setConfirm(null)
    }
  }

  // Adapter handlers for Modal
  const handleSuccess = confirmDelete
  const handleError = (error: Error) => {
    setToast({ type: 'error', text: error.message })
    setConfirm(null)
  }
  const handleCancel = cancelDelete

  return (
    <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5">
      <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
        <div className="bg-white dark:bg-gray-800 shadow-md sm:rounded-lg overflow-hidden">

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between p-4 space-y-3 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Search"
                  className="w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white"
                />
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" clipRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                </svg>
              </div>
            </div>
   <button
  onClick={onAdd}
  className="
    flex items-center justify-center
    text-white
    bg-blue-500 hover:bg-blue-600
    border border-blue-500
    rounded-lg
    px-4 py-2 text-sm font-medium
    focus:outline-none focus:ring-4 focus:ring-blue-300
  ">
  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" clipRule="evenodd"
      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
  </svg>
  Add
</button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-200">
                <tr>
                  {cols.map(col => (
                    <th key={String(col)} className="px-4 py-3">
                      {String(col)
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, s => s.toUpperCase())}
                    </th>
                  ))}
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map(item => (
                  <tr key={item.id} className="border-b dark:border-gray-700">
                    {cols.map(col => (
                      <td key={String(col)} className="px-4 py-3">
                        {typeof item[col] === 'object'
                          ? JSON.stringify(item[col])
                          : String(item[col])}
                      </td>
                    ))}
                    <td className="px-4 py-3 flex justify-end space-x-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => startDelete(item)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <nav className="flex flex-col md:flex-row justify-between items-center p-4 space-y-2 md:space-y-0">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)}
              </span> of <span className="font-semibold text-gray-900 dark:text-white">
                {filtered.length}
              </span>
            </span>
            <ul className="inline-flex -space-x-px">
              <li>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-white border rounded-l-lg disabled:opacity-50"
                >
                  Prev
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pNo => (
                <li key={pNo}>
                  <button
                    onClick={() => setPage(pNo)}
                    className={`px-3 py-1 border ${pNo === page ? 'bg-primary-50 text-primary-600' : 'bg-white'}`}
                  >
                    {pNo}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 bg-white border rounded-r-lg disabled:opacity-50"
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmItem && (
        <Modal
          isOpen={true}
          message={`Are you sure you want to delete this item?`}
          url={`/api/${String(cols[0])}/${confirmItem.id}`}
          method="DELETE"
          onSuccess={handleSuccess}
          onError={handleError}
          onClose={handleCancel}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.text}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  )
}
