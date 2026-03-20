import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

const BOTTOM_THRESHOLD_PX = 100

export function useScrollToBottom(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  messages: any[],
  isLoading?: boolean,
  resetKey?: string | null,
) {
  const messagesData = JSON.stringify(messages)

  const previousMessagesDataRef = useRef(messagesData)
  const initializedForKeyRef = useRef<string | null>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      const element = scrollRef.current
      if (!element) return

      element.scrollTo({
        top: element.scrollHeight,
        behavior,
      })
    },
    [scrollRef],
  )

  const handleScroll = useCallback(() => {
    const element = scrollRef.current
    if (!element) return

    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight

    setShouldAutoScroll(distanceFromBottom < BOTTOM_THRESHOLD_PX)
  }, [scrollRef])

  useEffect(() => {
    initializedForKeyRef.current = null
    previousMessagesDataRef.current = messagesData
    setShouldAutoScroll(true)
  }, [resetKey])

  useLayoutEffect(() => {
    if (!scrollRef.current || messages.length === 0) {
      return
    }

    if (initializedForKeyRef.current === resetKey) {
      return
    }

    initializedForKeyRef.current = resetKey ?? '__default__'

    scrollToBottom('auto')

    const rafId = window.requestAnimationFrame(() => {
      scrollToBottom('auto')
    })

    const timeoutId = window.setTimeout(() => {
      scrollToBottom('auto')
    }, 120)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.clearTimeout(timeoutId)
    }
  }, [messagesData, messages.length, resetKey, scrollRef, scrollToBottom])

  useEffect(() => {
    const hasContentChanged = previousMessagesDataRef.current !== messagesData
    previousMessagesDataRef.current = messagesData

    if (!hasContentChanged) {
      return
    }

    if (shouldAutoScroll || isLoading) {
      const rafId = window.requestAnimationFrame(() => {
        scrollToBottom(isLoading ? 'auto' : 'smooth')
      })

      return () => {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [messagesData, shouldAutoScroll, isLoading, scrollToBottom])

  useEffect(() => {
    const element = scrollRef.current
    if (!element || !isLoading || !shouldAutoScroll) {
      return
    }

    const observer = new ResizeObserver(() => {
      scrollToBottom('auto')
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [isLoading, scrollRef, scrollToBottom, shouldAutoScroll])

  return { handleScroll, scrollToBottom }
}
