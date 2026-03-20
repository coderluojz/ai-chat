import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useAuthStore } from '@/lib/store/auth-store';
import { handleUnauthorized } from './axios-instance';
import type { UIBlock } from '@/lib/types/block';
import { SSEEventType } from '@/lib/types/sse-events';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  return useAuthStore.getState().token;
}

/** SSE 事件回调接口 */
export interface ChatStreamCallbacks {
  /** Block 开始生成 */
  onBlockStart: (blockId: string, blockType: string) => void;
  /** 文本增量 */
  onTextDelta: (blockId: string, content: string) => void;
  /** 完整 Block 就绪 */
  onBlockComplete: (block: UIBlock) => void;
  /** 流结束 */
  onDone: () => void;
  /** 错误 */
  onError: (err: Error) => void;
}

export const chatApi = {
  stream: async (
    message: string,
    sessionId: string | undefined,
    callbacks: ChatStreamCallbacks,
    signal?: AbortSignal,
  ) => {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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
          if (
            response.ok &&
            response.headers.get('content-type') === 'text/event-stream'
          ) {
            return;
          }
          if (response.status === 401) {
            handleUnauthorized();
          }
          throw new Error(`HTTP ${response.status}`);
        },
        onmessage(msg) {
          if (msg.data === '[DONE]') {
            callbacks.onDone();
            return;
          }
          try {
            const data = JSON.parse(msg.data);

            switch (data.type) {
              case 'block_start':
                if (data.blockId && data.blockType) {
                  callbacks.onBlockStart(data.blockId, data.blockType);
                }
                break;

              case SSEEventType.TEXT_DELTA:
                if (data.blockId && data.content) {
                  callbacks.onTextDelta(data.blockId, data.content);
                }
                break;

              case SSEEventType.BLOCK_COMPLETE:
                if (data.block) {
                  callbacks.onBlockComplete(data.block as UIBlock);
                }
                break;

              case SSEEventType.ERROR:
                callbacks.onError(new Error(data.message || '未知错误'));
                break;

              default:
                // 向后兼容旧版纯文本格式
                if (data.content && !data.type) {
                  callbacks.onTextDelta('legacy-text', data.content);
                }
                break;
            }
          } catch {
            // ignore parse errors
          }
        },
        onclose() {
          callbacks.onDone();
        },
        onerror(err) {
          callbacks.onError(err);
          throw err;
        },
      });
    } catch (error) {
      callbacks.onError(error as Error);
    }
  },
};
