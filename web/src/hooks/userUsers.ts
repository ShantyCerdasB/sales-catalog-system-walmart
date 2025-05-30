import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/apiClient'

/**
 * Shape of a user tal como lo expone el backend.
 */
export interface User {
  id: string
  username: string
  email?: string
  passwordHash: string
  roles: string[]
}


export function useUsers() {
  return useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await apiClient.get<User[]>('/users')
      return data
    },
  })
}
