'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BlockShellProps {
  children: ReactNode;
  className?: string;
}

export function BlockShell({ children, className }: BlockShellProps) {
  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] shadow-[0_14px_40px_-28px_rgba(15,23,42,0.55)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/[0.035]',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface BlockHeaderProps {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function BlockHeader({
  icon,
  title,
  description,
  action,
  className,
}: BlockHeaderProps) {
  if (!icon && !title && !description && !action) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 border-b border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] px-4 py-3',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-accent/[0.12] text-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              {icon}
            </div>
          )}
          {title && (
            <div className="min-w-0 text-sm font-semibold tracking-tight text-foreground/95">
              {title}
            </div>
          )}
        </div>
        {description && (
          <p className="mt-1 text-xs leading-5 text-zinc-400">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

interface BlockCaptionProps {
  children: ReactNode;
  className?: string;
}

export function BlockCaption({ children, className }: BlockCaptionProps) {
  if (!children) {
    return null;
  }

  return (
    <p className={cn('px-4 pb-4 text-xs leading-5 text-zinc-400', className)}>
      {children}
    </p>
  );
}
