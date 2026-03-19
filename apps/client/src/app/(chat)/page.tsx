'use client';

import { WelcomeView } from '@/components/chat/welcome-view'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChatInput } from '@/components/chat/input'
import { useChatLayout } from '@/lib/hooks/use-chat-layout'

export default function HomePage() {
  const router = useRouter()
  const [input, setInput] = useState('')

  const {
    isStreaming,
    handleSubmit,
    stop,
  } = useChatLayout(null)

  const handleSubmitWrapper = async () => {
    if (!input.trim() || isStreaming) return
    setInput('')

    await handleSubmit(input, (newSessionId) => {
      if (newSessionId) {
        router.push(`/chat/${newSessionId}`)
      }
    })
  }

  return (
    <div className="flex flex-col h-full relative bg-black/5 dark:bg-white/1px">
      <div className="flex-1">
        <WelcomeView />
      </div>

      <ChatInput
        input={input}
        setInput={setInput}
        isLoading={isStreaming}
        onSubmit={handleSubmitWrapper}
        onStop={stop}
      />
    </div>
  )
}
