'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { BlockShell, BlockHeader } from './block-shell';
import { cn } from '@/lib/utils';

interface CodeFrameProps {
  code: string;
  language?: string;
  filename?: string;
  children?: ReactNode;
  className?: string;
}

export function CodeFrame({
  code,
  language,
  filename,
  children,
  className,
}: CodeFrameProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
  };

  return (
    <BlockShell className={cn('max-w-3xl', className)}>
      <BlockHeader
        icon={
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          </div>
        }
        title={
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {filename && (
              <span className="truncate text-xs font-medium text-zinc-200">
                {filename}
              </span>
            )}
            {language && (
              <span className="rounded-lg border border-white/12 bg-white/[0.1] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-200">
                {language}
              </span>
            )}
          </div>
        }
        action={
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? '已复制代码' : '复制代码'}
            title={copied ? '已复制代码' : '复制代码'}
            className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-white/12 bg-white/[0.08] px-2 text-zinc-300 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.12] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        }
      />
      <div className="code-surface overflow-x-auto border-t border-white/[0.08] bg-[linear-gradient(180deg,rgba(2,6,23,0.78),rgba(15,23,42,0.62))] p-4 text-[13px] leading-6 text-zinc-50 custom-scrollbar">
        {children ?? <code className="font-mono">{code}</code>}
      </div>
    </BlockShell>
  );
}
