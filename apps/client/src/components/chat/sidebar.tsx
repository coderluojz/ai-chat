'use client';

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/lib/auth-context'
import { LogOut, MessageSquare, Plus, Trash2 } from 'lucide-react'

type Session = {
  id: string;
  title: string;
};

type ChatSidebarProps = {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onLogout: () => void;
};

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onLogout,
}: ChatSidebarProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="flex flex-col w-[260px] h-[calc(100vh-1.5rem)] m-3 glass-card rounded-3xl border border-white/5 p-4 transition-all duration-500 ease-in-out shrink-0 relative overflow-hidden group/sidebar shadow-sm">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-30 group-hover/sidebar:opacity-60 transition-opacity duration-500" />

      <div className="flex items-center px-4 py-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center mr-3 shadow-lg shadow-accent/20 transition-transform group-hover/sidebar:scale-110 duration-500">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-base font-black tracking-tighter text-foreground leading-none">AI对话</h1>
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-accent/60">Intelligence</span>
        </div>
      </div>

      <Button
        className="w-full justify-center gap-2 h-11 px-4 bg-accent hover:bg-accent/90 text-white rounded-xl shadow-lg shadow-accent/10 font-bold text-sm mb-6 transition-all active:scale-[0.98] group/new"
        onClick={onNewSession}
      >
        <Plus className="w-4 h-4 group-hover/new:rotate-90 transition-transform duration-300" />
        开启新对话
      </Button>

      <div className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/40 mb-3">
        近期会话记录
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2 custom-scrollbar">
        <div className="space-y-2 pb-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`group/item w-full text-left px-3 py-1 rounded-xl text-[13px] cursor-pointer flex items-center justify-between transition-all duration-300 relative overflow-hidden ${
                activeSessionId === session.id
                  ? 'bg-accent/10 border border-accent/20 text-foreground font-bold shadow-sm'
                  : 'hover:bg-white/5 border border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {activeSessionId === session.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-full animate-in fade-in slide-in-from-left-2 duration-300" />
              )}
              <span className="truncate flex-1 pr-2 relative z-10">{session.title || '无标题对话'}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className={`cursor-pointer transition-all ml-2 shrink-0 p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive ${
                  activeSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100'
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="px-5 py-8 text-center border-2 border-dashed border-white/5 rounded-[2rem] opacity-30">
              <p className="text-xs font-medium">暂无会话</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
        <div
          className="w-full flex items-center gap-3 h-14 px-3 hover:bg-white/5 rounded-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-white/5 group/user"
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-accent font-black text-xs shadow-inner group-hover/user:bg-accent group-hover/user:text-white transition-all duration-300">
            {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="text-xs font-bold truncate w-full text-foreground/90">{user.name || user.email}</span>
            <span className="text-[9px] text-muted-foreground/60 truncate w-full font-medium">{user.email}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center gap-2 h-10 px-4 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-destructive/10"
          onClick={onLogout}
        >
          <LogOut className="w-3.5 h-3.5" />
          退出通行证
        </Button>
      </div>
    </aside>
  );
}
