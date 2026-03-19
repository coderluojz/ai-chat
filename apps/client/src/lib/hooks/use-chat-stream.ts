import { useCallback, useRef, useState } from 'react';
import { api } from '../api-client';
import { useChatStore } from '../store/chat-store';

interface UseChatStreamOptions {
  onDone?: () => void;
  onError?: (err: Error) => void;
}

export function useChatStream(options?: UseChatStreamOptions) {
  const { onDone, onError } = options || {};
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useChatStore((state) => state.addMessage);
  const addOrUpdateLastMessage = useChatStore((state) => state.addOrUpdateLastMessage);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

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

      setIsLoading(true);

      await api.chat.stream(
        message,
        sessionId,
        (content) => {
          addOrUpdateLastMessage(effectiveSessionId, content);
        },
        () => {
          setIsLoading(false);
          abortControllerRef.current = null;
          onDone?.();
        },
        (err) => {
          if (err.name !== 'AbortError') {
            onError?.(err);
          }
          setIsLoading(false);
          abortControllerRef.current = null;
        },
        controller.signal,
      );
    },
    [addMessage, addOrUpdateLastMessage, onDone, onError],
  );

  return { stream, stop, isLoading };
}
