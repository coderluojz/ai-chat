import { httpClient } from './axios-instance'
import type { Message, Session } from '@/lib/types'

export const sessionsApi = {
  getAll: () =>
    httpClient.get<Session[]>('/sessions'),

  create: (title?: string) =>
    httpClient.post<Session>('/sessions', { title }),

  update: (id: string, title: string) =>
    httpClient.patch<{ id: string; title: string }>(`/sessions/${id}`, { title }),

  delete: (id: string) =>
    httpClient.delete<{ success: boolean }>(`/sessions/${id}`),

  getMessages: (sessionId: string) =>
    httpClient.get<Message[]>(`/sessions/${sessionId}/messages`),
}
