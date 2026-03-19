import { httpClient } from './axios-instance'
import type { User, AuthResponse, LoginCredentials, RegisterData } from '@/lib/types'

export const authApi = {
  register: (data: RegisterData) =>
    httpClient.post<AuthResponse>('/auth/register', data),

  login: (credentials: LoginCredentials) =>
    httpClient.post<AuthResponse>('/auth/login', credentials),

  getProfile: () =>
    httpClient.get<User>('/auth/me'),

  forgotPassword: (email: string) =>
    httpClient.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    httpClient.post<{ message: string }>('/auth/reset-password', { token, newPassword }),

  changePassword: (currentPassword: string, newPassword: string) =>
    httpClient.put<{ message: string }>('/auth/change-password', { currentPassword, newPassword }),
}
