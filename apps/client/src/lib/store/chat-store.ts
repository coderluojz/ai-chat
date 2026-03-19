import { create } from 'zustand'
import type { Message, Session } from '../types'

interface ChatState {
  sessions: Session[]
  messages: Record<string, Message[]>
  activeSessionId: string | null
  initializedSessions: Set<string>
  isStreaming: boolean
  setSessions: (sessions: Session[]) => void
  addSession: (session: Session) => void
  setMessages: (sessionId: string, messages: Message[]) => void
  addMessage: (sessionId: string, message: Message) => void
  updateLastMessage: (sessionId: string, content: string) => void
  addOrUpdateLastMessage: (sessionId: string, content: string) => void
  clearMessages: (sessionId: string) => void
  setActiveSessionId: (id: string | null) => void
  markSessionInitialized: (sessionId: string) => void
  isSessionInitialized: (sessionId: string) => boolean
  setIsStreaming: (isStreaming: boolean) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  messages: {},
  activeSessionId: null,
  initializedSessions: new Set(),
  isStreaming: false,
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
      const sessionMessages = state.messages[sessionId] || []
      const lastMessage = sessionMessages[sessionMessages.length - 1]
      if (lastMessage && lastMessage.role === 'assistant') {
        const updatedMessages = [...sessionMessages]
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + content,
        }
        return {
          messages: { ...state.messages, [sessionId]: updatedMessages },
        }
      }
      return state
    }),
  clearMessages: (sessionId) =>
    set((state) => ({
      messages: { ...state.messages, [sessionId]: [] },
    })),
  addOrUpdateLastMessage: (sessionId, content) =>
    set((state) => {
      const sessionMessages = state.messages[sessionId] || []
      const lastMessage = sessionMessages[sessionMessages.length - 1]
      if (lastMessage && lastMessage.role === 'assistant') {
        const updatedMessages = [...sessionMessages]
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + content,
        }
        return {
          messages: { ...state.messages, [sessionId]: updatedMessages },
        }
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
        }
      }
    }),
  setActiveSessionId: (id) => set({ activeSessionId: id }),
  markSessionInitialized: (sessionId) =>
    set((state) => {
      const newSet = new Set(state.initializedSessions)
      newSet.add(sessionId)
      return { initializedSessions: newSet }
    }),
  isSessionInitialized: (sessionId) => get().initializedSessions.has(sessionId),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
}))
