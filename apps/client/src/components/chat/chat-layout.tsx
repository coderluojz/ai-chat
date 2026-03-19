'use client';

import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Trash2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { ChatSidebar } from '@/components/chat/sidebar'
import { PageLoader } from '@/components/chat/page-loader'
import { WelcomeView } from '@/components/chat/welcome-view'
import { ChatInput } from '@/components/chat/input'
import { MessageList } from '@/components/chat/message-list'
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

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type Session = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export default function ChatLayout({
  children,
  sessionId: initialSessionId,
}: {
  children?: React.ReactNode;
  sessionId?: string;
}) {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();

  // 从路由参数读取 activeSessionId
  const activeSessionId = initialSessionId || (params?.id as string) || null;

  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  // 二次确认弹窗状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // 用于防止重复加载会话列表
  const sessionsLoadedRef = useRef(false);

  // 用于控制流式请求的取消
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  // 未登录时跳转到登录页
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // 加载会话列表（只在用户首次登录时加载一次，后续由业务操作触发刷新）
  const loadSessions = useCallback(async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
    } catch {
      // ignore
    }
  }, []); // 空依赖：loadSessions 本身不会因 activeSessionId 变化而重建

  useEffect(() => {
    if (user && !sessionsLoadedRef.current) {
      sessionsLoadedRef.current = true;
      loadSessions();
    }
  }, [user, loadSessions]);

  // 切换会话时加载消息（不影响 sessions 的请求）
  useEffect(() => {
    // 切换会话时，主动终止之前的流请求
    handleStop();

    if (activeSessionId) {
      setIsMessagesLoading(true);
      // 加载新会话前先清空旧消息，提供即时的视觉反馈
      setMessages([]);

      api
        .getMessages(activeSessionId)
        .then((data) => {
          setMessages(
            data.map((m) => ({
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
          );
        })
        .catch(() => setMessages([]))
        .finally(() => setIsMessagesLoading(false));
    } else {
      setMessages([]);
    }
  }, [activeSessionId, handleStop]);

  const handleNewChat = () => {
    handleStop();
    router.push('/');
    setMessages([]);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await api.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        router.push('/');
      }
      toast.success('删除会话成功');
    } catch (err: any) {
      toast.error(err.message || '删除会话失败');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    // 清理之前的控制器并新建
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let sessionId = activeSessionId;
    let isNewSession = false;

    // 如果没有 sessionId，说明是新对话
    if (!sessionId) {
      try {
        const session = await api.createSession(input.slice(0, 20));
        sessionId = session.id;
        isNewSession = true;
      } catch (err: any) {
        toast.error(err.message || '创建会话失败');
        setIsLoading(false);
        abortControllerRef.current = null;
        return;
      }
    }

    // 开始流式请求
    await api.streamChat(
      userMessage.content,
      sessionId || undefined,
      (content) => {
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            return prev.map((msg, idx) =>
              idx === prev.length - 1 ? { ...msg, content: msg.content + content } : msg
            );
          } else {
            return [...prev, { id: 'assistant-' + Date.now(), role: 'assistant', content }];
          }
        });
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
        abortControllerRef.current = null;
        if (isNewSession && sessionId) {
          // 对话结束后，跳转到新会话路由并刷新列表
          router.replace(`/chat/${sessionId}`);
          loadSessions();
        }
      },
      (err) => {
        if (err.name === 'AbortError') {
          console.log('Stream aborted by user');
        } else {
          toast.error(err.message || '对话出错，请重试');
        }
        setIsLoading(false);
        abortControllerRef.current = null;
      },
      controller.signal,
    );
  };

  // 认证加载中
  if (authLoading) {
    return <PageLoader />;
  }

  if (!user) return null;

  return (
    <div className="flex h-screen w-screen bg-background text-foreground font-sans selection:bg-accent/30 selection:text-white relative overflow-hidden">
      {/* 动态背景背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full animate-float-delayed" />
      </div>

      <div className="flex flex-1 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => router.push(`/chat/${id}`)}
          onNewSession={handleNewChat}
          onDeleteSession={setShowDeleteConfirm}
          onLogout={() => setShowLogoutConfirm(true)}
        />

        <main className="flex flex-col flex-1 relative overflow-hidden border-l border-white/5">
        <header className="flex h-16 shrink-0 items-center justify-between px-8 z-20 sticky top-0 bg-white/5 backdrop-blur-xl border-b border-white/5">
          <div className="flex flex-col">
            <h2 className="text-base font-black tracking-tight truncate max-w-[200px] md:max-w-[400px]">
              {sessions.find((s) => s.id === activeSessionId)?.title || '即时通讯'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">终端在线</span>
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
            {isMessagesLoading ? (
              <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent animate-bounce [animation-duration:0.8s] [animation-delay:-0.3s]"></div>
                    <div className="w-3 h-3 rounded-full bg-accent animate-bounce [animation-duration:0.8s] [animation-delay:-0.15s]"></div>
                    <div className="w-3 h-3 rounded-full bg-accent animate-bounce [animation-duration:0.8s]"></div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent/60">加载加密信道...</span>
                </div>
              </div>
            ) : null}
            
            {!activeSessionId && messages.length === 0 ? (
              <WelcomeView />
            ) : (
              <MessageList messages={messages} isLoading={isLoading} />
            )}
          </div>

          <ChatInput
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onStop={handleStop}
          />
      </main>
    </div>

      {/* 删除确认弹窗 */}
      <AlertDialog open={!!showDeleteConfirm} onOpenChange={(open: boolean) => !open && setShowDeleteConfirm(null)}>
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
              onClick={() => showDeleteConfirm && handleDeleteSession(showDeleteConfirm)}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 退出登录确认弹窗 */}
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
  );
}
