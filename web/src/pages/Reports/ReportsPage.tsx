import { useTopProducts, useTopClients, type TopProduct, type TopClient } from '../../hooks/useReports'

export default function ReportsPage() {
  const {
    data: topProducts = [],
    isLoading: loadingP,
    error: errorP,
  } = useTopProducts()

  const {
    data: topClients = [],
    isLoading: loadingC,
    error: errorC,
  } = useTopClients()

  if (loadingP || loadingC) return <div className="p-4">Loading reports…</div>
  if (errorP) return <div className="p-4 text-red-600">Error loading products: {errorP.message}</div>
  if (errorC) return <div className="p-4 text-red-600">Error loading clients: {errorC.message}</div>

  return (
    <div className="p-6 space-y-10">
      {/* Top Products */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Top Products by Units Sold</h2>
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Product Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Units Sold</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((row: TopProduct) => (
                <tr key={row.product.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3">{row.product.code}</td>
                  <td className="px-4 py-3">{row.product.name}</td>
                  <td className="px-4 py-3">{row.totalUnits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top Clients */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Top Clients by Transactions</h2>
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Client Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {topClients.map((row: TopClient) => (
                <tr key={row.client.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3">{row.client.code}</td>
                  <td className="px-4 py-3">{row.client.name}</td>
                  <td className="px-4 py-3">{row.transactionCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
