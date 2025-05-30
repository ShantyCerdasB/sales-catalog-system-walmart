import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/apiClient'

/**
 * Shape of a sale line‐item returned by GET /sales
 */
export interface SaleItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  discountApplied: number
  createdAt: string
  updatedAt: string
}

/**
 * Shape of a sale record returned by GET /sales
 */
export interface Sale {
  id: string
  clientId: string | null
  date: string
  subtotal: number
  discountTotal: number
  total: number
  paymentMethod: 'cash'
  isCanceled: boolean
  createdAt: string
  updatedAt: string
  items: SaleItem[]
}

/**
 * Fetches & caches the list of sales.
 */
export function useSales() {
  return useQuery<Sale[], Error>({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data } = await apiClient.get<Sale[]>('/sales')
      return data
    },
  })
}
