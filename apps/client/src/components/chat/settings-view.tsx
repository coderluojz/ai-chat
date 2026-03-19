'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/lib/store/auth-store'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Shield,
  User,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export function SettingsView() {
  const user = useAuthStore((state) => state.user)
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('两次输入的新密码不一致')
      return
    }

    if (newPassword.length < 6) {
      toast.error('新密码长度不能少于 6 位')
      return
    }

    if (currentPassword === newPassword) {
      toast.error('新密码不能与当前密码相同')
      return
    }

    setIsLoading(true)

    try {
      await api.auth.changePassword(currentPassword, newPassword)
      toast.success('密码修改成功')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '修改失败，请重试'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full overflow-auto p-6 md:p-8">
      <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground/60 hover:text-foreground hover:text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="w-4 h-4" />
          返回对话
        </Button>

        {/* 个人信息卡片 */}
        <div className="glass-card rounded-[2.5rem] p-10 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <User className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">
              个人信息
            </h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 dark:bg-black/20 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-accent/80 mb-1">
                  用户名
                </p>
                <p className="text-foreground font-bold truncate">
                  {user?.name || '未设置'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 dark:bg-black/20 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-accent/80 mb-1">
                  邮箱地址
                </p>
                <p className="text-foreground font-bold truncate">
                  {user?.email || '未设置'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 dark:bg-black/20 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-accent/80 mb-1">
                  注册时间
                </p>
                <p className="text-foreground font-bold truncate">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '未知'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 修改密码卡片 */}
        <div className="glass-card rounded-[2.5rem] p-10 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">
              安全设置
            </h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="space-y-3">
              <Label
                htmlFor="currentPassword"
                className="text-xs block font-black uppercase tracking-[0.2em] text-accent/80 ml-1"
              >
                当前密码 / 验证身份
              </Label>
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 transition-colors group-focus-within/input:text-accent" />
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="请输入当前密码"
                  required
                  disabled={isLoading}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-white/5 dark:bg-black/20 border-white/10 focus:border-accent/40 focus:ring-accent/10 h-14 pl-12 rounded-2xl transition-all duration-300 placeholder:text-muted-foreground/30 text-base"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="newPassword"
                className="text-xs block font-black uppercase tracking-[0.2em] text-accent/80 ml-1"
              >
                新密码 / 至少 6 位
              </Label>
              <div className="relative group/input">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 transition-colors group-focus-within/input:text-accent" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  required
                  disabled={isLoading}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 transition-colors group-focus-within/input:text-accent" />
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
                  确认修改{' '}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
