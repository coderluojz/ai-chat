'use client'

import { useRouter } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import { api } from './api'

type User = {
  id: string
  email: string
  name: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 启动时检查已有 token
  useEffect(() => {
    const token = api.getToken()
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(true)
      api
        .getProfile()
        .then((profile) => {
          setUser({
            id: profile.id,
            email: profile.email || '',
            name: profile.name || '',
          })
        })
        .catch((err) => {
          // 只有在明确是 401 Unauthorized 或者 403 Forbidden 时才清除 token
          // 避免因为 500 系统错误或者网络波动导致用户被强制登出
          if (err.status === 401 || err.status === 403) {
            api.setToken(null)
            setUser(null)
          }
          console.error('Auth initialization error:', err)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await api.login(email, password)
      api.setToken(result.access_token)
      setUser(result.user)
      toast.success('登录成功')
      router.push('/')
    },
    [router],
  )

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const result = await api.register(email, password, name)
      api.setToken(result.access_token)
      setUser(result.user)
      toast.success('账户创建成功')
      router.push('/')
    },
    [router],
  )

  const logout = useCallback(() => {
    api.setToken(null)
    setUser(null)
    toast.success('已安全退出登录')
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内使用')
  }
  return context
}
