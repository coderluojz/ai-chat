'use client';

import { ArrowUpRight, ExternalLink, Sparkles } from 'lucide-react';
import type { CardBlockContent } from '@/lib/types/block';
import { BlockCaption, BlockHeader, BlockShell } from './block-shell';

interface CardBlockProps {
  content: CardBlockContent;
}

export function CardBlock({ content }: CardBlockProps) {
  return (
    <BlockShell className="max-w-md">
      {content.imageUrl && (
        <div className="relative h-44 w-full overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/35 via-slate-950/5 to-transparent" />
          <img
            src={content.imageUrl}
            alt={content.title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
          />
        </div>
      )}
      <BlockHeader
        icon={<Sparkles className="h-4 w-4" />}
        title={content.title}
        description={content.description}
        className={content.imageUrl ? 'border-b-0 bg-transparent px-4 pt-4 pb-1' : 'border-b-0 bg-transparent px-4 pt-4 pb-1'}
      />
      <div className="space-y-3 px-4 pb-4">
        {content.actions && content.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {content.actions.map((action, index) => (
              <a
                key={index}
                href={action.url || '#'}
                target={action.url ? '_blank' : undefined}
                rel="noreferrer"
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                  action.variant === 'primary'
                    ? 'bg-accent text-white shadow-lg shadow-indigo-950/30 hover:bg-indigo-400'
                    : 'border border-white/10 bg-white/[0.08] text-foreground/85 hover:bg-white/[0.12]'
                }`}
              >
                {action.label}
                {action.url ? (
                  action.variant === 'primary' ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ExternalLink className="h-3.5 w-3.5" />
                  )
                ) : null}
              </a>
            ))}
          </div>
        )}
        {!content.description && !content.actions?.length && (
          <BlockCaption className="px-0 pb-0">已生成信息卡片内容。</BlockCaption>
        )}
      </div>
    </BlockShell>
  );
}
