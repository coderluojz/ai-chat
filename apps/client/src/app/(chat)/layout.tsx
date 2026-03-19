'use client';

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

import { ChatSidebar } from '@/components/chat/sidebar'
import { PageLoader } from '@/components/chat/page-loader'
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

export default function ChatGroupLayout({ children }: { children: React.ReactNode }) {
  const { isLoading: authLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()

  const activeSessionId = (params?.id as string) || null
  const isSettings = pathname === '/settings'

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const {
    user,
    sessions,
    handleNewChat,
    handleDeleteSession,
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

  const handleSelectSession = (id: string) => {
    router.push(`/chat/${id}`)
  }

  const handleSelectSettings = () => {
    router.push('/settings')
  }

  if (authLoading) {
    return <PageLoader />
  }

  if (!user) return null

  const headerTitle = isSettings
    ? '个人设置'
    : sessions.find((s) => s.id === activeSessionId)?.title || '即时通讯'

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
          isSettings={isSettings}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewChatWrapper}
          onDeleteSession={setShowDeleteConfirm}
          onSelectSettings={handleSelectSettings}
          onLogout={() => setShowLogoutConfirm(true)}
        />

        <main className="flex flex-col flex-1 relative overflow-hidden border-l border-white/5">
          <header className="flex h-16 shrink-0 items-center justify-between px-8 z-20 sticky top-0 bg-white/5 backdrop-blur-xl border-b border-white/5">
            <div className="flex flex-col">
              <h2 className="text-base font-black tracking-tight truncate max-w-[200px] md:max-w-[400px]">
                {headerTitle}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  终端在线
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {activeSessionId && !isSettings && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 px-4 gap-2 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-xl font-bold text-xs transition-all opacity-40 hover:opacity-100 cursor-pointer"
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

          {/* 嵌套路由内容区 */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
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
