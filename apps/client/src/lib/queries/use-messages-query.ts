import { sessionsApi } from '@/api'
import { useQuery } from '@tanstack/react-query'

export const messageKeys = {
  all: ['messages'] as const,
  lists: () => [...messageKeys.all, 'list'] as const,
  list: (sessionId: string) => [...messageKeys.lists(), sessionId] as const,
}

export function useMessages(sessionId: string | undefined) {
  return useQuery({
    queryKey: messageKeys.list(sessionId || ''),
    queryFn: () => {
      if (!sessionId) throw new Error('Session ID is required')
      return sessionsApi.getMessages(sessionId)
    },
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000,
  })
}
