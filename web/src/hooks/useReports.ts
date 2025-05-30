import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/apiClient'
import type { ClientResponse } from '../types/client'
import type { ProductResponse } from '../types/product'

/** One entry of the “top products” report. */
export interface TopProduct {
  product: ProductResponse
  totalUnits: number
}

/** One entry of the “top clients” report. */
export interface TopClient {
  client: ClientResponse
  transactionCount: number
}

/**
 * Fetches the top products by units sold.
 * Calls GET /reports/top-products.
 */
export function useTopProducts() {
  return useQuery<TopProduct[], Error>({
    queryKey: ['reports', 'topProducts'],
    queryFn: async () => {
      const { data } = await apiClient.get<TopProduct[]>('/reports/top-products')
      return data
    },
  })
}

/**
 * Fetches the top clients by transaction count.
 * Calls GET /reports/top-clients.
 */
export function useTopClients() {
  return useQuery<TopClient[], Error>({
    queryKey: ['reports', 'topClients'],
    queryFn: async () => {
      const { data } = await apiClient.get<TopClient[]>('/reports/top-clients')
      return data
    },
  })
}
