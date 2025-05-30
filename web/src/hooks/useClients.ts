import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/apiClient'

interface Client {
  id: string
  code: string
  name: string
  nit: string
  email?: string
  phone?: string
}

export function useClients() {
  return useQuery<Client[], Error>({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await apiClient.get<Client[]>('/clients')
      return data
    },
  })
}
