import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-background font-sans selection:bg-accent/30">
      {/* 沉浸式流体动态背景 */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-fluid opacity-60" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col px-6 py-10 md:px-10">
        {/* 精致的导航/Logo */}
        <header className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20 transition-all group-hover:shadow-accent/40 group-hover:rotate-3">
              <span className="text-white text-xl font-black italic">A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-foreground leading-none">AI 对话</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mt-0.5">Next Generation AI</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">文档</Link>
            <Link href="#" className="hover:text-foreground transition-colors">联系我们</Link>
          </div>
        </header>

        {/* 核心认证卡片区域 */}
        <main className="flex-1 flex items-center justify-center w-full max-w-lg mx-auto py-12">
          {children}
        </main>

        {/* 高品质页脚 */}
        <footer className="w-full max-w-7xl mx-auto mt-auto pt-10 border-t border-border/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
            <p className="font-medium text-muted-foreground/50">
              © 2024 AI 对话. 版权所有。
            </p>
            <div className="flex items-center gap-8 font-semibold text-muted-foreground/40">
              <Link href="#" className="hover:text-muted-foreground transition-colors">隐私政策</Link>
              <Link href="#" className="hover:text-muted-foreground transition-colors">服务协议</Link>
              <Link href="#" className="hover:text-muted-foreground transition-colors">系统状态</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
