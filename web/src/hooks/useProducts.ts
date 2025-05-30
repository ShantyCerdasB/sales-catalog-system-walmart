import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/apiClient'

/**
 * Shape of a product record from the API.
 */
export interface Product {
  id: string
  code: string
  name: string
  /** optional description text */
  description?: string | null
  price: number
  unit: string
    discount?: {
    percentage: number
  }
  isDeleted?: boolean
  createdAt: string
  updatedAt: string
  
}

/**
 * Fetches & caches the list of products.
 */
export function useProducts() {
  return useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await apiClient.get<Product[]>('/products')
      return data
    },
  })
}
