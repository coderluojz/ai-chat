import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/lib/store/auth-store'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface ApiErrorResponse {
  code: number
  message: string
  data: null
  timestamp: string
  path: string
}

export class ApiError extends Error {
  code: number
  timestamp: string
  path: string

  constructor(data: ApiErrorResponse) {
    super(data.message)
    this.name = 'ApiError'
    this.code = data.code
    this.timestamp = data.timestamp
    this.path = data.path
  }
}

function getToken(): string | null {
  return useAuthStore.getState().token
}

export function setToken(token: string | null): void {
  useAuthStore.getState().setToken(token)
}

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password']

export function handleUnauthorized(): void {
  if (typeof window === 'undefined') return

  const currentPath = window.location.pathname
  const isPublicPath = PUBLIC_PATHS.some((path) => currentPath.startsWith(path))

  if (!isPublicPath) {
    useAuthStore.getState().logout()
    window.location.href = '/login'
  }
}

export interface HttpClient {
  get<T>(url: string): Promise<T>
  post<T>(url: string, data?: unknown): Promise<T>
  put<T>(url: string, data?: unknown): Promise<T>
  patch<T>(url: string, data?: unknown): Promise<T>
  delete<T>(url: string): Promise<T>
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const { data, status } = error.response

      // 401 未授权，清除登录状态并跳转到登录页
      if (status === 401) {
        handleUnauthorized()
      }

      throw new ApiError({
        code: data?.code || status,
        message: data?.message || '请求失败',
        data: null,
        timestamp: data?.timestamp || new Date().toISOString(),
        path: data?.path || error.config?.url || '',
      })
    }
    throw new ApiError({
      code: 0,
      message: error.message || '网络错误',
      data: null,
      timestamp: new Date().toISOString(),
      path: '',
    })
  },
)

const httpClient: HttpClient = {
  get: <T>(url: string) => axiosInstance.get<unknown, T>(url),
  post: <T>(url: string, data?: unknown) => axiosInstance.post<unknown, T>(url, data),
  put: <T>(url: string, data?: unknown) => axiosInstance.put<unknown, T>(url, data),
  patch: <T>(url: string, data?: unknown) => axiosInstance.patch<unknown, T>(url, data),
  delete: <T>(url: string) => axiosInstance.delete<unknown, T>(url),
}

export { httpClient }
