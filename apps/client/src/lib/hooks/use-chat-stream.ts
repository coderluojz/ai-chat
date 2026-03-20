import { useCallback, useRef } from 'react';
import { chatApi } from '@/api';
import { useChatStore } from '../store/chat-store';
import type { UIBlock } from '../types/block';
import { BlockType } from '../types/block';

interface UseChatStreamOptions {
  onDone?: () => void;
  onError?: (err: Error) => void;
}

export function useChatStream(options?: UseChatStreamOptions) {
  const { onDone, onError } = options || {};
  const abortControllerRef = useRef<AbortController | null>(null);

  const addMessage = useChatStore((state) => state.addMessage);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const setIsStreaming = useChatStore((state) => state.setIsStreaming);
  const createAssistantMessageWithBlocks = useChatStore(
    (state) => state.createAssistantMessageWithBlocks,
  );
  const appendTextDeltaToLastMessage = useChatStore(
    (state) => state.appendTextDeltaToLastMessage,
  );
  const appendBlockToLastMessage = useChatStore(
    (state) => state.appendBlockToLastMessage,
  );
  const addPendingBlock = useChatStore((state) => state.addPendingBlock);
  const removePendingBlock = useChatStore((state) => state.removePendingBlock);
  const clearPendingBlocks = useChatStore((state) => state.clearPendingBlocks);

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

      // 清空 pending blocks
      clearPendingBlocks(effectiveSessionId);

      // 添加用户消息
      addMessage(effectiveSessionId, {
        id: userMessageId,
        role: 'user',
        content: message,
      });

      // 创建 AI 回复消息（预设一个空文本 Block）
      const textBlockId = `text-${Date.now()}`;
      createAssistantMessageWithBlocks(effectiveSessionId, textBlockId);

      setIsStreaming(true);

      await chatApi.stream(
        message,
        sessionId,
        {
          onBlockStart: (blockId: string, blockType: string) => {
            addPendingBlock(effectiveSessionId, blockId, blockType);
          },
          onTextDelta: (blockId, content) => {
            appendTextDeltaToLastMessage(effectiveSessionId, blockId, content);
          },
          onBlockComplete: (block: UIBlock) => {
            removePendingBlock(effectiveSessionId, block.id);
            appendBlockToLastMessage(effectiveSessionId, block);
          },
          onDone: () => {
            clearPendingBlocks(effectiveSessionId);
            setIsStreaming(false);
            abortControllerRef.current = null;
            onDone?.();
          },
          onError: (err) => {
            if (err.name !== 'AbortError') {
              onError?.(err);
            }
            clearPendingBlocks(effectiveSessionId);
            setIsStreaming(false);
            abortControllerRef.current = null;
          },
        },
        controller.signal,
      );
    },
    [
      addMessage,
      createAssistantMessageWithBlocks,
      appendTextDeltaToLastMessage,
      appendBlockToLastMessage,
      addPendingBlock,
      removePendingBlock,
      clearPendingBlocks,
      setIsStreaming,
      onDone,
      onError,
    ],
  );

  return { stream, stop, isLoading: isStreaming };
}
