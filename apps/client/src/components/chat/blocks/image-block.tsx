'use client';

import { Image as ImageIcon, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { ImageBlockContent } from '@/lib/types/block';
import { BlockCaption, BlockHeader, BlockShell } from './block-shell';

interface ImageBlockProps {
  content: ImageBlockContent;
}

export function ImageBlock({ content }: ImageBlockProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <BlockShell className="max-w-3xl">
        <div className="flex h-56 items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-zinc-500">
            <ImageIcon className="h-8 w-8" />
            <span className="text-sm">图片加载失败</span>
          </div>
        </div>
      </BlockShell>
    );
  }

  return (
    <BlockShell className="max-w-3xl">
      <BlockHeader
        icon={<Sparkles className="h-4 w-4" />}
        title={content.alt || '生成图片'}
        description={
          content.width && content.height
            ? `${content.width} × ${content.height}`
            : 'AI 视觉生成结果'
        }
      />
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/15 backdrop-blur-sm animate-pulse">
            <ImageIcon className="h-8 w-8 text-zinc-600" />
          </div>
        )}
        <img
          src={content.url}
          alt={content.alt || 'AI 生成的图片'}
          className="w-full bg-white/[0.02] object-contain"
          style={{
            maxHeight: '512px',
            width: content.width ? `${content.width}px` : undefined,
            height: content.height ? `${content.height}px` : undefined,
          }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      </div>
      {content.caption && <BlockCaption className="pt-3 italic">{content.caption}</BlockCaption>}
    </BlockShell>
  );
}
