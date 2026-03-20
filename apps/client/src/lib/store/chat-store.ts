import { create } from 'zustand';
import type { Message, Session } from '../types';
import type { UIBlock } from '../types/block';
import { BlockType } from '../types/block';

interface ChatState {
  sessions: Session[];
  messages: Record<string, Message[]>;
  activeSessionId: string | null;
  initializedSessions: Set<string>;
  isStreaming: boolean;
  pendingBlocks: Record<string, { id: string; type: string }[]>; // 正在生成的 blocks

  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  setMessages: (sessionId: string, messages: Message[]) => void;
  addMessage: (sessionId: string, message: Message) => void;
  updateLastMessage: (sessionId: string, content: string) => void;
  addOrUpdateLastMessage: (sessionId: string, content: string) => void;
  clearMessages: (sessionId: string) => void;
  setActiveSessionId: (id: string | null) => void;
  markSessionInitialized: (sessionId: string) => void;
  isSessionInitialized: (sessionId: string) => boolean;
  setIsStreaming: (isStreaming: boolean) => void;

  // --- Pending Block 操作 ---
  addPendingBlock: (sessionId: string, blockId: string, blockType: string) => void;
  removePendingBlock: (sessionId: string, blockId: string) => void;
  clearPendingBlocks: (sessionId: string) => void;

  // --- Generative UI Block 操作 ---

  /** 为最后一条 AI 消息追加一个完整 Block */
  appendBlockToLastMessage: (sessionId: string, block: UIBlock) => void;

  /** 为最后一条 AI 消息的指定文本 Block 追加增量内容 */
  appendTextDeltaToLastMessage: (
    sessionId: string,
    blockId: string,
    delta: string,
  ) => void;

  /** 创建新的 AI 消息并返回其初始空 Block 列表 */
  createAssistantMessageWithBlocks: (
    sessionId: string,
    textBlockId: string,
  ) => void;
}

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  messages: {},
  activeSessionId: null,
  initializedSessions: new Set(),
  isStreaming: false,
  pendingBlocks: {},

  setSessions: (sessions) => set({ sessions }),
  addSession: (session) =>
    set((state) => ({
      sessions: [session, ...state.sessions],
    })),
  setMessages: (sessionId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [sessionId]: messages },
    })),
  addMessage: (sessionId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [sessionId]: [...(state.messages[sessionId] || []), message],
      },
    })),
  updateLastMessage: (sessionId, content) =>
    set((state) => {
      const sessionMessages = state.messages[sessionId] || [];
      const lastMessage = sessionMessages[sessionMessages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        const updatedMessages = [...sessionMessages];
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + content,
        };
        return {
          messages: { ...state.messages, [sessionId]: updatedMessages },
        };
      }
      return state;
    }),
  clearMessages: (sessionId) =>
    set((state) => ({
      messages: { ...state.messages, [sessionId]: [] },
    })),
  addOrUpdateLastMessage: (sessionId, content) =>
    set((state) => {
      const sessionMessages = state.messages[sessionId] || [];
      const lastMessage = sessionMessages[sessionMessages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        const updatedMessages = [...sessionMessages];
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + content,
        };
        return {
          messages: { ...state.messages, [sessionId]: updatedMessages },
        };
      } else {
        return {
          messages: {
            ...state.messages,
            [sessionId]: [
              ...sessionMessages,
              {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content,
              },
            ],
          },
        };
      }
    }),
  setActiveSessionId: (id) => set({ activeSessionId: id }),
  markSessionInitialized: (sessionId) =>
    set((state) => {
      const newSet = new Set(state.initializedSessions);
      newSet.add(sessionId);
      return { initializedSessions: newSet };
    }),
  isSessionInitialized: (sessionId) => get().initializedSessions.has(sessionId),
  setIsStreaming: (isStreaming) => set({ isStreaming }),

  // --- Pending Block 操作 ---
  addPendingBlock: (sessionId, blockId, blockType) =>
    set((state) => ({
      pendingBlocks: {
        ...state.pendingBlocks,
        [sessionId]: [
          ...(state.pendingBlocks[sessionId] || []),
          { id: blockId, type: blockType },
        ],
      },
    })),
  removePendingBlock: (sessionId, blockId) =>
    set((state) => ({
      pendingBlocks: {
        ...state.pendingBlocks,
        [sessionId]: (state.pendingBlocks[sessionId] || []).filter(
          (b) => b.id !== blockId
        ),
      },
    })),
  clearPendingBlocks: (sessionId) =>
    set((state) => ({
      pendingBlocks: {
        ...state.pendingBlocks,
        [sessionId]: [],
      },
    })),

  // --- Generative UI Block 操作实现 ---

  appendBlockToLastMessage: (sessionId, block) =>
    set((state) => {
      const sessionMessages = state.messages[sessionId] || [];
      const lastMessage = sessionMessages[sessionMessages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        const updatedMessages = [...sessionMessages];
        const existingBlocks = lastMessage.blocks || [];
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          blocks: [...existingBlocks, block],
          content:
            block.type === BlockType.TEXT
              ? lastMessage.content +
                (block.content as { text: string }).text
              : lastMessage.content,
        };
        return {
          messages: { ...state.messages, [sessionId]: updatedMessages },
        };
      }
      return state;
    }),

  appendTextDeltaToLastMessage: (sessionId, blockId, delta) =>
    set((state) => {
      const sessionMessages = state.messages[sessionId] || [];
      const lastMessage = sessionMessages[sessionMessages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        const updatedMessages = [...sessionMessages];
        const blocks = [...(lastMessage.blocks || [])];

        // 查找目标文本 Block
        const targetIndex = blocks.findIndex((b) => b.id === blockId);
        if (targetIndex >= 0) {
          const targetBlock = blocks[targetIndex];
          blocks[targetIndex] = {
            ...targetBlock,
            content: {
              ...targetBlock.content,
              text:
                ((targetBlock.content as { text: string }).text || '') + delta,
            },
          };
        } else {
          // 如果不存在，创建新的文本 Block
          blocks.push({
            id: blockId,
            type: BlockType.TEXT,
            content: { text: delta },
          });
        }

        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          blocks,
          content: lastMessage.content + delta,
        };
        return {
          messages: { ...state.messages, [sessionId]: updatedMessages },
        };
      }
      return state;
    }),

  createAssistantMessageWithBlocks: (sessionId, textBlockId) =>
    set((state) => {
      const sessionMessages = state.messages[sessionId] || [];
      const newMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        blocks: [
          {
            id: textBlockId,
            type: BlockType.TEXT,
            content: { text: '' },
          },
        ],
      };
      return {
        messages: {
          ...state.messages,
          [sessionId]: [...sessionMessages, newMessage],
        },
      };
    }),
}));
