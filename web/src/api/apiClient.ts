import axios from 'axios'
import { getAccessToken, onTokenRefresh } from '../auth/useAuth'

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send and accept HttpOnly cookies
})

apiClient.interceptors.request.use(
  config => {
    const token = getAccessToken()
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  err => Promise.reject(err)
)

apiClient.interceptors.response.use(
  res => res,
  async err => {
    const orig = err.config
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true
      await onTokenRefresh()
      return apiClient(orig)
    }
    return Promise.reject(err)
  }
)

export default apiClient
