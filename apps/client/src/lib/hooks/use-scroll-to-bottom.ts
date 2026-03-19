import { useCallback, useEffect, useRef, useState } from 'react'

export function useScrollToBottom(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  messages: any[],
  isLoading?: boolean,
) {
  const messagesData = JSON.stringify(messages)
  const lastMessagesData = useRef(messagesData)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  const scrollToBottom = useCallback(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [scrollRef])

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
    setShouldAutoScroll(isAtBottom)
  }, [scrollRef])

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (messagesData > lastMessagesData.current) {
      if (shouldAutoScroll || isLoading) {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        })
      }
    }
    lastMessagesData.current = messagesData
  }, [messagesData, scrollRef, shouldAutoScroll, isLoading])

  return { handleScroll }
}
