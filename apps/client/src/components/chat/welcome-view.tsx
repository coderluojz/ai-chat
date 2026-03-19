'use client'

import { useAuth } from '@/lib/auth-context'
import { Sparkles } from 'lucide-react'
import { AmbientParticles } from './ambient-particles'

export function WelcomeView() {
  const { user } = useAuth()
  const userName = user?.name || user?.email?.split('@')[0] || '朋友'

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative overflow-hidden bg-background selection:bg-accent/20">
      <AmbientParticles />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[80%] bg-accent/5 blur-[220px] rounded-full pointer-events-none opacity-30 animate-pulse-subtle" />

      <div className="max-w-4xl w-full space-y-12 relative z-10 flex flex-col items-center">
        <div className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-12 duration-1200 ease-out">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/5 border border-accent/10 text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-accent uppercase mb-4 animate-pulse-subtle">
            <Sparkles className="w-3.5 h-3.5" />
            Welcome Back
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-[900] tracking-tighter text-foreground/90 leading-[1] selection:text-accent">
            Hi, <span className="animate-gradient-text px-2">{userName}</span>
          </h1>

          <p className="max-w-lg mx-auto text-base sm:text-lg text-muted-foreground/40 font-medium leading-relaxed tracking-wide">
            准备好开始今天的深度对话了吗？
          </p>
        </div>

        <div className="w-px h-24 bg-gradient-to-b from-accent/40 to-transparent animate-in fade-in slide-in-from-top-12 duration-1000 delay-700" />
      </div>
    </div>
  )
}
