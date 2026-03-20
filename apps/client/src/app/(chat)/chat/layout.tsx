'use client';

import { useState } from 'react'
import { useParams } from 'next/navigation'

import { ChatInput } from '@/components/chat/input'
import { MessageList } from '@/components/chat/message-list'
import { WelcomeView } from '@/components/chat/welcome-view'
import { useChatLayout } from '@/lib/hooks/use-chat-layout'

export default function ChatContentLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const activeSessionId = (params?.id as string) || null

  const [input, setInput] = useState('')

  const {
    messages,
    isStreaming,
    isMessagesLoading,
    handleSubmit,
    stop,
  } = useChatLayout(activeSessionId)

  const handleSubmitWrapper = async () => {
    if (!input.trim() || isStreaming) return
    setInput('')

    await handleSubmit(input)
  }

  return (
    <div className="flex flex-col h-full relative bg-black/5 dark:bg-white/1px">
      {isMessagesLoading && messages.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-accent animate-bounce [animation-duration:0.8s] [animation-delay:-0.3s]"></div>
              <div className="w-3 h-3 rounded-full bg-accent animate-bounce [animation-duration:0.8s] [animation-delay:-0.15s]"></div>
              <div className="w-3 h-3 rounded-full bg-accent animate-bounce [animation-duration:0.8s]"></div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent/60">
              加载加密信道...
            </span>
          </div>
        </div>
      ) : null}

      {!activeSessionId && messages.length === 0 ? (
        <div className="flex-1">
          <WelcomeView />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <MessageList messages={messages} isLoading={isStreaming} activeSessionId={activeSessionId} />
        </div>
      )}

      <ChatInput
        input={input}
        setInput={setInput}
        isLoading={isStreaming}
        onSubmit={handleSubmitWrapper}
        onStop={stop}
      />

      {children}
    </div>
  )
}
