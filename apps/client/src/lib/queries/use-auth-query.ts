import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api-client';
import type { User, LoginCredentials, RegisterData } from '../types';
import { useAuthStore } from '../store/auth-store';

export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

export function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const result = await api.auth.login(credentials);
      api.setToken(result.access_token);
      setUser(result.user);
      queryClient.setQueryData(authKeys.profile(), result.user);
      return result;
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const result = await api.auth.register(data);
      api.setToken(result.access_token);
      setUser(result.user);
      queryClient.setQueryData(authKeys.profile(), result.user);
      return result;
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return () => {
    api.setToken(null);
    setUser(null);
    queryClient.clear();
  };
}

export function useProfile() {
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const profile = await api.auth.getProfile();
      setUser(profile);
      return profile;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
