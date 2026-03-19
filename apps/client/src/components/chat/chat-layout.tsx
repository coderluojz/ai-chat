'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

import { ChatInput } from '@/components/chat/input'
import { MessageList } from '@/components/chat/message-list'
import { PageLoader } from '@/components/chat/page-loader'
import { ChatSidebar } from '@/components/chat/sidebar'
import { WelcomeView } from '@/components/chat/welcome-view'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/lib/auth-context'
import { useChatLayout } from '@/lib/hooks/use-chat-layout'

export default function ChatLayout({
  children,
  sessionId: initialSessionId,
}: {
  children?: React.ReactNode
  sessionId?: string
}) {
  const { isLoading: authLoading, logout } = useAuth()
  const router = useRouter()
  const params = useParams()

  const activeSessionId = initialSessionId || (params?.id as string) || null

  const [input, setInput] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  )
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const {
    user,
    sessions,
    messages,
    isStreaming,
    isMessagesLoading,
    handleNewChat,
    handleDeleteSession,
    handleSubmit,
    stop,
  } = useChatLayout(activeSessionId)

  const handleNewChatWrapper = () => {
    handleNewChat()
    router.push('/')
  }

  const handleDeleteSessionWrapper = async (sessionId: string) => {
    await handleDeleteSession(sessionId)
    if (activeSessionId === sessionId) {
      router.push('/')
    }
    setShowDeleteConfirm(null)
  }

  const handleSubmitWrapper = async () => {
    await handleSubmit(input, (newSessionId) => {
      setInput('')
      if (newSessionId) {
        router.push(`/chat/${newSessionId}`)
      }
    })
  }

  if (authLoading) {
    return <PageLoader />
  }

  if (!user) return null

  return (
    <div className="flex h-screen w-screen bg-background text-foreground font-sans selection:bg-accent/30 selection:text-white relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full animate-float-delayed" />
      </div>

      <div className="flex flex-1 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => router.push(`/chat/${id}`)}
          onNewSession={handleNewChatWrapper}
          onDeleteSession={setShowDeleteConfirm}
          onLogout={() => setShowLogoutConfirm(true)}
        />

        <main className="flex flex-col flex-1 relative overflow-hidden border-l border-white/5">
          <header className="flex h-16 shrink-0 items-center justify-between px-8 z-20 sticky top-0 bg-white/5 backdrop-blur-xl border-b border-white/5">
            <div className="flex flex-col">
              <h2 className="text-base font-black tracking-tight truncate max-w-[200px] md:max-w-[400px]">
                {sessions.find((s) => s.id === activeSessionId)?.title ||
                  '即时通讯'}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  终端在线
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {activeSessionId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 px-4 gap-2 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-xl font-bold text-xs transition-all opacity-40 hover:opacity-100"
                  onClick={() => setShowDeleteConfirm(activeSessionId)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">删除存档</span>
                </Button>
              )}
              <div className="h-8 w-[1px] bg-white/5" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-black text-[10px] border border-accent/20">
                  AI
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-hidden relative bg-black/5 dark:bg-white/1px">
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
              <WelcomeView />
            ) : (
              <MessageList messages={messages} isLoading={isStreaming} />
            )}
          </div>

          <ChatInput
            input={input}
            setInput={setInput}
            isLoading={isStreaming}
            onSubmit={handleSubmitWrapper}
            onStop={stop}
          />
        </main>
      </div>

      <AlertDialog
        open={!!showDeleteConfirm}
        onOpenChange={(open: boolean) => !open && setShowDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除会话？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作不可撤销，该会话的所有聊天记录都将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                showDeleteConfirm &&
                handleDeleteSessionWrapper(showDeleteConfirm)
              }
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认退出登录？</AlertDialogTitle>
            <AlertDialogDescription>
              退出后您需要重新登录才能访问您的聊天记录。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={logout}>确认退出</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
