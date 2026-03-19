'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api-client'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  KeyRound,
  Loader2,
  Lock,
  ShieldAlert,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { toast } from 'sonner'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 处理 Supabase 的 hash fragment (#access_token=xxx&type=recovery)
  // 以及普通查询参数 (?token=xxx)
  const getTokenFromHash = () => {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash;
    if (!hash) return null;
    const hashParams = new URLSearchParams(hash.substring(1));
    return hashParams.get('access_token') || hashParams.get('token');
  };

  const token = searchParams.get('token') || searchParams.get('access_token') || getTokenFromHash();

  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error('无效的重置链接')
      return
    }

    if (password !== confirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }

    if (password.length < 6) {
      toast.error('密码长度不能少于 6 位')
      return
    }

    setIsLoading(true)

    try {
      await api.auth.resetPassword(token, password)
      setIsSuccess(true)
      toast.success('密码重置成功')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '重置失败，请重试'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col space-y-3 mb-10 text-left md:text-center md:items-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
            链接已失效
          </h1>
          <p className="text-muted-foreground text-lg max-w-[320px] font-medium leading-relaxed">
            重置链接无效或已过期，请重新申请
          </p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-10 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-50" />

          <Link href="/forgot-password" className="cursor-pointer">
            <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-accent/20 bg-accent hover:bg-accent/90 text-white active:scale-[0.98] group/btn text-sm cursor-pointer">
              <span className="flex items-center gap-2">
                重新申请重置{' '}
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col space-y-3 mb-10 text-left md:text-center md:items-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 animate-in zoom-in duration-500">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
            密码已重置
          </h1>
          <p className="text-muted-foreground text-lg max-w-[320px] font-medium leading-relaxed">
            您的密码已成功更新，请使用新密码登录
          </p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-10 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent opacity-50" />

          <Link href="/login" className="cursor-pointer">
            <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-accent/20 bg-accent hover:bg-accent/90 text-white active:scale-[0.98] group/btn text-sm cursor-pointer">
              <span className="flex items-center gap-2">
                立即登录{' '}
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col space-y-3 mb-10 text-left md:text-center md:items-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
          <KeyRound className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
          设置新密码
        </h1>
        <p className="text-muted-foreground text-lg max-w-[320px] font-medium leading-relaxed">
          请输入您的新密码，确保账户安全
        </p>
      </div>

      <div className="glass-card rounded-[2.5rem] p-10 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label
              htmlFor="password"
              className="text-xs block font-black uppercase tracking-[0.2em] text-accent/80 ml-1"
            >
              新密码 / 至少 6 位
            </Label>
            <div className="relative group/input">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 transition-colors group-focus-within/input:text-accent" />
              <Input
                id="password"
                type="password"
                placeholder="请输入新密码"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="bg-white/5 dark:bg-black/20 border-white/10 focus:border-accent/40 focus:ring-accent/10 h-14 pl-12 rounded-2xl transition-all duration-300 placeholder:text-muted-foreground/30 text-base"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="confirmPassword"
              className="text-xs block font-black uppercase tracking-[0.2em] text-accent/80 ml-1"
            >
              确认密码 / 再次输入
            </Label>
            <div className="relative group/input">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 transition-colors group-focus-within/input:text-accent" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                required
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                className="bg-white/5 dark:bg-black/20 border-white/10 focus:border-accent/40 focus:ring-accent/10 h-14 pl-12 rounded-2xl transition-all duration-300 placeholder:text-muted-foreground/30 text-base"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-2xl mt-4 font-black uppercase tracking-widest transition-all shadow-xl shadow-accent/20 bg-accent hover:bg-accent/90 text-white active:scale-[0.98] group/btn text-sm cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                正在更新密码...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                确认重置{' '}
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center text-sm">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-muted-foreground/60 font-medium hover:text-accent transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            返回登录
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
