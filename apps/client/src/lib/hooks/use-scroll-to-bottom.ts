import { useCallback, useEffect, useRef, useState } from 'react';

export function useScrollToBottom(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  messagesLength: number,
) {
  const lastMessagesLength = useRef(messagesLength);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isAtBottom);
  }, [scrollRef]);

  useEffect(() => {
    if (scrollRef.current && messagesLength > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setShouldAutoScroll(true);
    }
    lastMessagesLength.current = messagesLength;
  }, [scrollRef, messagesLength]);

  useEffect(() => {
    if (messagesLength > lastMessagesLength.current) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setShouldAutoScroll(true);
    }
    lastMessagesLength.current = messagesLength;
  }, [messagesLength, scrollRef]);

  return { handleScroll };
}
