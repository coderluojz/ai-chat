'use client'

import { useChatStream } from '@/lib/hooks/use-chat-stream'
import { useMessages } from '@/lib/queries/use-messages-query'
import {
  useCreateSession,
  useDeleteSession,
  useSessions,
} from '@/lib/queries/use-sessions-query'
import { useAuthStore } from '@/lib/store/auth-store'
import { useChatStore } from '@/lib/store/chat-store'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'

export function useChatLayout(activeSessionId: string | null) {
  const user = useAuthStore((state) => state.user)

  const sessions = useChatStore((state) => state.sessions)
  const messagesList = useChatStore((state) => state.messages)

  const messages = useMemo(
    () => messagesList[activeSessionId || 'temp'] || [],
    [activeSessionId, messagesList],
  )

  const setSessions = useChatStore((state) => state.setSessions)
  const setMessages = useChatStore((state) => state.setMessages)
  const clearMessages = useChatStore((state) => state.clearMessages)
  const setActiveSessionId = useChatStore((state) => state.setActiveSessionId)

  const sessionsQuery = useSessions()
  const messagesQuery = useMessages(activeSessionId || undefined)
  const createSessionMutation = useCreateSession()
  const deleteSessionMutation = useDeleteSession()

  const initializedSessionsRef = useRef<Set<string>>(new Set())

  const {
    stream,
    stop,
    isLoading: isStreaming,
  } = useChatStream({
    onDone: () => {
      if (activeSessionId) {
        sessionsQuery.refetch()
      }
    },
    onError: (err) => {
      toast.error(err.message || '对话出错，请重试')
    },
  })

  useEffect(() => {
    if (sessionsQuery.data) {
      setSessions(sessionsQuery.data)
    }
  }, [sessionsQuery.data, setSessions])

  useEffect(() => {
    if (messagesQuery.data && activeSessionId) {
      if (!initializedSessionsRef.current.has(activeSessionId)) {
        setMessages(activeSessionId, messagesQuery.data)
        initializedSessionsRef.current.add(activeSessionId)
      }
    } else if (!activeSessionId) {
      clearMessages('temp')
    }
  }, [messagesQuery.data, activeSessionId, setMessages, clearMessages])

  const handleNewChat = useCallback(() => {
    stop()
    setActiveSessionId(null)
    clearMessages('temp')
  }, [stop, setActiveSessionId, clearMessages])

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await deleteSessionMutation.mutateAsync(sessionId)
        if (activeSessionId === sessionId) {
          setActiveSessionId(null)
          clearMessages('temp')
        }
        toast.success('删除会话成功')
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '删除会话失败'
        toast.error(message)
      }
    },
    [deleteSessionMutation, activeSessionId, setActiveSessionId, clearMessages],
  )

  const handleSubmit = useCallback(
    async (input: string, onSuccess: (sessionId?: string) => void) => {
      if (!input.trim() || isStreaming) return null

      let sessionId = activeSessionId
      let isNewSession = false

      if (!sessionId) {
        try {
          const session = await createSessionMutation.mutateAsync(
            input.slice(0, 20),
          )
          sessionId = session.id
          setActiveSessionId(sessionId)
          isNewSession = true
          clearMessages(sessionId)
          // 标记为已初始化，防止 messagesQuery 覆盖
          initializedSessionsRef.current.add(sessionId)

          onSuccess?.(sessionId)
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : '创建会话失败'
          toast.error(message)
          return null
        }
      }

      onSuccess?.()
      await stream(input, sessionId || undefined)

      if (isNewSession && sessionId) {
        sessionsQuery.refetch()
      }

      return isNewSession ? sessionId : null
    },
    [
      activeSessionId,
      isStreaming,
      createSessionMutation,
      setActiveSessionId,
      clearMessages,
      stream,
      sessionsQuery,
    ],
  )

  return {
    user,
    sessions,
    messages,
    isStreaming,
    handleNewChat,
    handleDeleteSession,
    handleSubmit,
    stop,
    isMessagesLoading: messagesQuery.isLoading,
  }
}
