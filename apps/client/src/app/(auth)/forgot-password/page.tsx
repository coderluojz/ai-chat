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
  Mail,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await api.auth.forgotPassword(email)
      setIsSubmitted(true)
      toast.success('重置邮件已发送')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '发送失败，请稍后重试'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col space-y-3 mb-10 text-left md:text-center md:items-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 animate-in zoom-in duration-500">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
            验证邮件已送达
          </h1>
          <p className="text-muted-foreground text-lg max-w-[320px] font-medium leading-relaxed">
            重置链接已发送至{' '}
            <span className="text-foreground font-bold">{email}</span>
          </p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-10 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent opacity-50" />

          <div className="space-y-6">
            <div className="bg-white/5 dark:bg-black/20 rounded-2xl p-6 space-y-4 border border-white/5">
              <h3 className="font-black text-foreground uppercase tracking-wider text-sm">
                后续步骤
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                    1
                  </span>
                  <span className="text-sm">查收您的邮箱收件箱</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                    2
                  </span>
                  <span className="text-sm">
                    如未找到，请检查垃圾邮件文件夹
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                    3
                  </span>
                  <span className="text-sm">点击邮件中的链接重置密码</span>
                </li>
              </ul>
            </div>

            <Button
              variant="outline"
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all border-white/10 hover:border-accent/40 hover:bg-white/5 hover:text-accent text-sm cursor-pointer"
              onClick={() => setIsSubmitted(false)}
            >
              <span className="flex items-center gap-2">重新发送验证邮件</span>
            </Button>
          </div>

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

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col space-y-3 mb-10 text-left md:text-center md:items-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
          <KeyRound className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
          重置访问凭证
        </h1>
        <p className="text-muted-foreground text-lg max-w-[320px] font-medium leading-relaxed">
          输入您注册时使用的邮箱，我们将发送重置链接
        </p>
      </div>

      <div className="glass-card rounded-[2.5rem] p-10 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label
              htmlFor="email"
              className="text-xs block font-black uppercase tracking-[0.2em] text-accent/80 ml-1"
            >
              身份验证 / 注册邮箱
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

          <Button
            type="submit"
            className="w-full h-14 rounded-2xl mt-4 font-black uppercase tracking-widest transition-all shadow-xl shadow-accent/20 bg-accent hover:bg-accent/90 text-white active:scale-[0.98] group/btn text-sm cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                正在发送验证...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                发送重置链接{' '}
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
