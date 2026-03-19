import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionsApi } from '@/api';
import type { Session } from '../types';

export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: () => [...sessionKeys.lists()] as const,
  details: () => [...sessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
};

export function useSessions() {
  return useQuery({
    queryKey: sessionKeys.list(),
    queryFn: () => sessionsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title?: string) => sessionsApi.create(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.list() });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      sessionsApi.update(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.list() });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sessionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.list() });
    },
  });
}
