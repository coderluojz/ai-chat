import { useCallback, useRef } from 'react';
import { api } from '../api-client';
import { useChatStore } from '../store/chat-store';

interface UseChatStreamOptions {
  onDone?: () => void;
  onError?: (err: Error) => void;
}

export function useChatStream(options?: UseChatStreamOptions) {
  const { onDone, onError } = options || {};
  const abortControllerRef = useRef<AbortController | null>(null);

  const addMessage = useChatStore((state) => state.addMessage);
  const addOrUpdateLastMessage = useChatStore((state) => state.addOrUpdateLastMessage);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const setIsStreaming = useChatStore((state) => state.setIsStreaming);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, [setIsStreaming]);

  const stream = useCallback(
    async (message: string, sessionId: string | undefined) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const effectiveSessionId = sessionId || 'temp';
      const userMessageId = `user-${Date.now()}`;

      addMessage(
        effectiveSessionId,
        {
          id: userMessageId,
          role: 'user',
          content: message,
        },
      );

      setIsStreaming(true);

      await api.chat.stream(
        message,
        sessionId,
        (content) => {
          addOrUpdateLastMessage(effectiveSessionId, content);
        },
        () => {
          setIsStreaming(false);
          abortControllerRef.current = null;
          onDone?.();
        },
        (err) => {
          if (err.name !== 'AbortError') {
            onError?.(err);
          }
          setIsStreaming(false);
          abortControllerRef.current = null;
        },
        controller.signal,
      );
    },
    [addMessage, addOrUpdateLastMessage, setIsStreaming, onDone, onError],
  );

  return { stream, stop, isLoading: isStreaming };
}
