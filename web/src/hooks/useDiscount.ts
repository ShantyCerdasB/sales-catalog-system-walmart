import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/apiClient'

/**
 * Shape of a discount record from the API.
 */
export interface Discount {
  id: string
  code: string
  percentage: number
  validFrom: string
  validTo?: string | null
  isActive: boolean
  productId: string
}

/**
 * Fetches & caches all discounts.
 */
export function useDiscounts() {
  return useQuery<Discount[], Error>({
    queryKey: ['discounts'],
    queryFn: async () => {
      const { data } = await apiClient.get<Discount[]>('/discounts')
      return data
    },
  })
}
