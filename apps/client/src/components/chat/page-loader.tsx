'use client'

import { Bot } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* 渐变流光背景 */}
      <div className="absolute inset-0 pointer-events-none opactity-50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent/5 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="relative flex flex-col items-center gap-12">
        {/* 中心 Logo 动画 */}
        <div className="relative">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-accent via-indigo-500 to-purple-600 p-[2px] shadow-[0_0_50px_rgba(99,102,241,0.3)] animate-float">
            <div className="w-full h-full rounded-[1.85rem] bg-zinc-950 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-accent/10 animate-pulse" />
              <Bot className="w-10 h-10 text-white relative z-10" />
            </div>
          </div>
          {/* 四周的环绕粒子或描边 */}
          <div className="absolute -inset-4 rounded-[2.5rem] border border-accent/20 animate-[spin_10s_linear_infinite]" />
          <div className="absolute -inset-8 rounded-[3rem] border border-white/5 animate-[spin_15s_linear_infinite_reverse]" />
        </div>
      </div>
    </div>
  )
}
