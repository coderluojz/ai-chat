"use client";

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { ArrowRight, Loader2, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '登录失败，请检查邮箱和密码';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col space-y-3 mb-10 text-left md:text-center md:items-center">
        <h1 className="text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
          欢迎回来
        </h1>
        <p className="text-muted-foreground text-lg max-w-[320px] font-medium leading-relaxed">
          登录您的 AI 对话账号，继续与智慧碰撞
        </p>
      </div>

      <div className="glass-card rounded-[2.5rem] p-10 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-xs block font-black uppercase tracking-[0.2em] text-accent/80 ml-1">
              身份证明 / 邮箱地址
            </Label>
            <div className="relative group/input">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 transition-colors group-focus-within/input:text-accent" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 dark:bg-black/20 border-white/10 focus:border-accent/40 focus:ring-accent/10 h-14 pl-12 rounded-2xl transition-all duration-300 placeholder:text-muted-foreground/30 text-base"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <Label htmlFor="password" className="text-xs font-black uppercase tracking-[0.2em] text-accent/80">
                授权准入 / 安全密码
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-muted-foreground/40 hover:text-accent transition-colors"
              >
                遗忘凭证?
              </Link>
            </div>
            <div className="relative group/input">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 transition-colors group-focus-within/input:text-accent" />
              <Input
                id="password"
                type="password"
                placeholder="请输入您的密钥"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 dark:bg-black/20 border-white/10 focus:border-accent/40 focus:ring-accent/10 h-14 pl-12 rounded-2xl transition-all duration-300 placeholder:text-muted-foreground/30 text-base"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-2xl mt-4 font-black uppercase tracking-widest transition-all shadow-xl shadow-accent/20 bg-accent hover:bg-accent/90 text-white active:scale-[0.98] group/btn text-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                正在解析身份...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                建立连接 <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center text-sm">
          <p className="text-muted-foreground/60 font-medium">
            尚未获得授权？{" "}
            <Link
              href="/register"
              className="font-black text-foreground hover:text-accent transition-colors underline-offset-4 hover:underline"
            >
              申请新身份
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
