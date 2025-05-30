import  {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/apiClient'
import { jwtDecode } from 'jwt-decode'

interface AuthResponse { accessToken: string }
interface JwtPayload { sub: string; roles: string[]; exp: number }

export interface AuthContextType {
  user: string | null
  roles: string[]
  login(username: string, password: string): Promise<void>
  logout(): void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser]               = useState<string | null>(null)
  const [roles, setRoles]             = useState<string[]>([])

  // On mount, attempt refresh
  useEffect(() => {
    apiClient.post<AuthResponse>('/auth/refresh')
      .then(r => setAccessToken(r.data.accessToken))
      .catch(() => setAccessToken(null))
  }, [])

  // Whenever token changes, decode it
  useEffect(() => {
    if (accessToken) {
      const { sub, roles: jwtRoles } = jwtDecode<JwtPayload>(accessToken)
      setUser(sub)
      setRoles(jwtRoles)
    } else {
      setUser(null)
      setRoles([])
    }
  }, [accessToken])

  // Axios interceptors for auto-inject and auto-refresh
  useEffect(() => {
    const reqId = apiClient.interceptors.request.use(cfg => {
      if (accessToken) {
        cfg.headers = cfg.headers || {}
        cfg.headers.Authorization = `Bearer ${accessToken}`
      }
      return cfg
    })
    const resId = apiClient.interceptors.response.use(
      r => r,
      async err => {
        const orig = err.config
        if (err.response?.status === 401 && !orig._retry) {
          orig._retry = true
          const r = await apiClient.post<AuthResponse>('/auth/refresh')
          setAccessToken(r.data.accessToken)
          return apiClient(orig)
        }
        return Promise.reject(err)
      }
    )
    return () => {
      apiClient.interceptors.request.eject(reqId)
      apiClient.interceptors.response.eject(resId)
    }
  }, [accessToken])

  async function login(username: string, password: string) {
    const resp = await apiClient.post<AuthResponse>('/auth/login', { username, password })
    setAccessToken(resp.data.accessToken)
  }

  function logout() {
    setAccessToken(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, roles, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
