'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { ArrowUp, Paperclip, Square } from 'lucide-react'

type ChatInputProps = {
  input: string
  setInput: (value: string) => void
  isLoading: boolean
  onSubmit: () => void
  onStop?: () => void
}

export function ChatInput({ input, setInput, isLoading, onSubmit, onStop }: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) {
      onStop?.()
    } else {
      onSubmit()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent pt-12 pb-8 px-6 z-20">
      <div className="max-w-6xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="relative flex w-full flex-col glass-morphism rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] focus-within:ring-2 focus-within:ring-accent/40 transition-all duration-500 bg-white/[0.03] border-white/10 group/input"
        >
          <Textarea
            tabIndex={0}
            onKeyDown={handleKeyDown}
            placeholder="发送消息..."
            className="min-h-[60px] max-h-[200px] w-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-5 py-4 shadow-none text-[15px] outline-none placeholder:text-muted-foreground/40"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex justify-between items-center px-4 pb-3 pt-0">
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground/60 rounded-full hover:bg-white/5 hover:text-foreground transition-all duration-300">
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() && !isLoading}
              className={cn(
                "h-10 w-10 rounded-full transition-all duration-500",
                isLoading
                  ? "bg-black text-foreground text-white active:scale-95"
                  : input.trim()
                    ? "bg-accent text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-105 active:scale-90"
                    : "bg-white/5 text-muted-foreground/40"
              )}
            >
              {isLoading ? (
                <Square className="w-3.5 h-3.5 fill-current transition-transform duration-300 animate-in fade-in zoom-in" />
              ) : (
                <ArrowUp className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  input.trim() ? "translate-y-0 opacity-100" : "translate-y-1 opacity-50"
                )} />
              )}
              <span className="sr-only">{isLoading ? '停止' : '发送'}</span>
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center text-[10px] uppercase tracking-widest text-muted-foreground/40 font-medium">
          Powered by Advanced AI Engine
        </div>
      </div>
    </div>
  )
}
