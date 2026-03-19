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
import { useCallback, useEffect, useMemo } from 'react'
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
  const addSession = useChatStore((state) => state.addSession)
  const setMessages = useChatStore((state) => state.setMessages)
  const clearMessages = useChatStore((state) => state.clearMessages)
  const setActiveSessionId = useChatStore((state) => state.setActiveSessionId)
  const markSessionInitialized = useChatStore((state) => state.markSessionInitialized)
  const isSessionInitialized = useChatStore((state) => state.isSessionInitialized)
  const isStreaming = useChatStore((state) => state.isStreaming)

  const sessionsQuery = useSessions()
  const messagesQuery = useMessages(activeSessionId || undefined)
  const createSessionMutation = useCreateSession()
  const deleteSessionMutation = useDeleteSession()

  const { stream, stop } = useChatStream({
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
      // 只有当会话未初始化且有消息数据时才设置
      if (!isSessionInitialized(activeSessionId) && messagesQuery.data.length > 0) {
        setMessages(activeSessionId, messagesQuery.data)
        markSessionInitialized(activeSessionId)
      }
    } else if (!activeSessionId) {
      clearMessages('temp')
    }
  }, [messagesQuery.data, activeSessionId, setMessages, clearMessages, isSessionInitialized, markSessionInitialized])

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
    async (input: string, onSuccess?: (sessionId?: string) => void) => {
      if (!input.trim() || isStreaming) return null

      let sessionId = activeSessionId
      let isNewSession = false

      if (!sessionId) {
        try {
          const session = await createSessionMutation.mutateAsync(
            input.slice(0, 20),
          )
          sessionId = session.id
          isNewSession = true

          // 乐观更新：立即将新会话添加到侧边栏列表
          addSession(session)
          // 立即激活新会话
          setActiveSessionId(sessionId)
          // 清空新会话的消息
          clearMessages(sessionId)
          // 标记为已初始化，防止 messagesQuery 覆盖
          markSessionInitialized(sessionId)

          // 立即跳转路由（在 stream 开始前）
          onSuccess?.(sessionId)
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : '创建会话失败'
          toast.error(message)
          return null
        }
      }

      // 调用 stream 添加消息到 store
      await stream(input, sessionId || undefined)

      // stream 完成后刷新会话列表以获取最新数据
      if (isNewSession) {
        sessionsQuery.refetch()
      }

      return isNewSession ? sessionId : null
    },
    [
      activeSessionId,
      isStreaming,
      createSessionMutation,
      addSession,
      setActiveSessionId,
      clearMessages,
      markSessionInitialized,
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
