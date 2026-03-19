import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api-client';
import type { Message } from '../types';

export const messageKeys = {
  all: ['messages'] as const,
  lists: () => [...messageKeys.all, 'list'] as const,
  list: (sessionId: string) => [...messageKeys.lists(), sessionId] as const,
};

export function useMessages(sessionId: string | undefined) {
  return useQuery({
    queryKey: messageKeys.list(sessionId || ''),
    queryFn: () => {
      if (!sessionId) throw new Error('Session ID is required');
      return api.sessions.getMessages(sessionId);
    },
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function invalidateMessages(sessionId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: messageKeys.list(sessionId) });
  };
}
