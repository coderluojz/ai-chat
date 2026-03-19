import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api'
import type { LoginCredentials, RegisterData } from '../types'
import { useAuthStore } from '../store/auth-store'

export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
}

export function useLogin() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  const setToken = useAuthStore((state) => state.setToken)

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const result = await authApi.login(credentials)
      setToken(result.access_token)
      setUser(result.user)
      queryClient.setQueryData(authKeys.profile(), result.user)
      return result
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  const setToken = useAuthStore((state) => state.setToken)

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const result = await authApi.register(data)
      setToken(result.access_token)
      setUser(result.user)
      queryClient.setQueryData(authKeys.profile(), result.user)
      return result
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const logout = useAuthStore((state) => state.logout)

  return () => {
    logout()
    queryClient.clear()
  }
}

export function useProfile() {
  const setUser = useAuthStore((state) => state.setUser)

  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const profile = await authApi.getProfile()
      setUser(profile)
      return profile
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authApi.resetPassword(token, newPassword),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(currentPassword, newPassword),
  })
}
