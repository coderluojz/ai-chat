'use client';

import { AlertTriangle } from 'lucide-react';
import { BlockHeader, BlockShell } from './block-shell';

interface FallbackBlockProps {
  type: string;
  content: unknown;
}

export function FallbackBlock({ type, content }: FallbackBlockProps) {
  return (
    <BlockShell className="max-w-2xl border-yellow-500/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.08),rgba(255,255,255,0.02))]">
      <BlockHeader
        icon={<AlertTriangle className="h-4 w-4 text-yellow-400" />}
        title={<span className="text-yellow-300">未知的 Block 类型: {type}</span>}
        description="当前内容无法匹配到已注册的渲染组件，已降级展示原始数据。"
        className="border-yellow-500/10"
      />
      <pre className="overflow-x-auto bg-yellow-500/[0.04] p-4 font-mono text-xs leading-6 text-zinc-300">
        {JSON.stringify(content, null, 2)}
      </pre>
    </BlockShell>
  );
}
