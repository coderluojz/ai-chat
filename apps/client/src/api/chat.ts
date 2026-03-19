import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useAuthStore } from '@/lib/store/auth-store'
import { handleUnauthorized } from './axios-instance'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getToken(): string | null {
  return useAuthStore.getState().token
}

export const chatApi = {
  stream: async (
    message: string,
    sessionId: string | undefined,
    onChunk: (content: string) => void,
    onDone: () => void,
    onError: (err: Error) => void,
    signal?: AbortSignal,
  ) => {
    const token = getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      await fetchEventSource(`${API_BASE}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          session_id: sessionId,
        }),
        signal,
        async onopen(response) {
          if (response.ok && response.headers.get('content-type') === 'text/event-stream') {
            return
          }
          // 401 未授权，清除登录状态并跳转到登录页
          if (response.status === 401) {
            handleUnauthorized()
          }
          throw new Error(`HTTP ${response.status}`)
        },
        onmessage(msg) {
          if (msg.data === '[DONE]') return
          try {
            const data = JSON.parse(msg.data)
            if (data.content) {
              onChunk(data.content)
            }
          } catch {
            // ignore parse errors
          }
        },
        onclose() {
          onDone()
        },
        onerror(err) {
          onError(err)
          throw err
        },
      })
    } catch (error) {
      onError(error as Error)
    }
  },
}
