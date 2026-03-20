'use client';

import { useScrollToBottom } from '@/lib/hooks/use-scroll-to-bottom';
import { Bot, Image, CreditCard, BarChart3, Code, Table } from 'lucide-react';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { BlockRenderer } from '@/components/chat/blocks';
import { useChatStore } from '@/lib/store/chat-store';
import type { Message } from '@/lib/types';
import type { UIBlock } from '@/lib/types/block';
import { BlockType } from '@/lib/types/block';

type MessageListProps = {
  messages: Message[];
  isLoading?: boolean;
  activeSessionId?: string | null;
};

const MESSAGE_TRANSITION = {
  duration: 0.32,
  ease: 'easeOut' as const,
};

const BLOCK_TRANSITION = {
  duration: 0.26,
  ease: 'easeOut' as const,
};

/** Block 骨架屏组件 */
function BlockSkeleton({ type }: { type: string }) {
  const iconMap: Record<string, typeof Image> = {
    image: Image,
    card: CreditCard,
    chart: BarChart3,
    code: Code,
    table: Table,
    text: Bot,
  };
  const labelMap: Record<string, string> = {
    image: '正在生成图片...',
    card: '正在生成卡片...',
    chart: '正在生成图表...',
    code: '正在生成代码...',
    table: '正在生成表格...',
    text: '正在生成内容...',
  };

  const Icon = iconMap[type] || Bot;
  const label = labelMap[type] || '正在生成...';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.985 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={BLOCK_TRANSITION}
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3"
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
        <Icon className="w-4 h-4 text-indigo-400 animate-pulse" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-zinc-400">{label}</div>
        <div className="mt-2 flex gap-1">
          <div className="h-1.5 w-16 bg-zinc-700/50 rounded animate-pulse" />
          <div className="h-1.5 w-24 bg-zinc-700/50 rounded animate-pulse [animation-delay:0.1s]" />
          <div className="h-1.5 w-12 bg-zinc-700/50 rounded animate-pulse [animation-delay:0.2s]" />
        </div>
      </div>
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce" />
      </div>
    </motion.div>
  );
}

/** 单条消息中的 Block 列表渲染器，带动画 */
function MessageBlocks({ blocks }: { blocks: UIBlock[] }) {
  // 检查是否有任何非空内容
  const hasContent = blocks.some(
    (block) =>
      block.type !== BlockType.TEXT ||
      (block.content as { text?: string })?.text
  );

  // 如果所有 blocks 都是空的 text block，显示 loading
  if (!hasContent) {
    return (
      <div className="flex min-h-7 items-center gap-1.5 py-1">
        <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-3.5">
      {blocks.map((block, index) => (
        <motion.div
          key={block.id}
          initial={{ opacity: 0, y: 8, scale: 0.99 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            ...BLOCK_TRANSITION,
            delay: index * 0.035,
          }}
        >
          <BlockRenderer block={block} />
        </motion.div>
      ))}
    </div>
  );
}

export function MessageList({ messages, isLoading, activeSessionId }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { handleScroll } = useScrollToBottom(scrollRef, messages, isLoading, activeSessionId);
  const allPendingBlocks = useChatStore((state) => state.pendingBlocks);
  const pendingBlocks = activeSessionId ? allPendingBlocks[activeSessionId] || [] : [];

  if (messages.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto px-4 md:px-6"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 pb-54">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={MESSAGE_TRANSITION}
            className="group relative mx-auto flex w-full max-w-6xl py-4 md:py-5"
          >
            {message.role === 'user' ? (
              <div className="flex w-full justify-end">
                <div className="max-w-[85%] rounded-3xl px-5 py-3 bubble-user text-[15px] leading-relaxed break-words font-medium md:max-w-[78%]">
                  {message.content}
                </div>
              </div>
            ) : (
              <div className="group/assistant flex w-full justify-start gap-3.5 md:gap-5">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-accent via-indigo-500 to-purple-600 p-[1.5px] shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover/assistant:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-500">
                    <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden relative">
                      <div className="absolute inset-0 bg-accent/10 animate-pulse-subtle" />
                      <Bot className="w-5 h-5 text-white relative z-10" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-block max-w-[min(100%,58rem)] rounded-[22px] bubble-ai px-4 py-3.5 shadow-lg md:px-5 md:py-4">
                    <div className="space-y-3.5">
                      {/* 优先渲染 blocks，否则降级为纯文本 */}
                      {message.blocks && message.blocks.length > 0 ? (
                        <MessageBlocks blocks={message.blocks} />
                      ) : message.content ? (
                        <div className="prose prose-neutral prose-sm max-w-none prose-p:leading-relaxed prose-p:my-1 text-foreground/95">
                          {message.content}
                        </div>
                      ) : (
                        /* 内容为空时显示 loading 指示器 */
                        isLoading && (
                          <div className="flex min-h-7 items-center gap-1.5 py-1">
                            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"></div>
                          </div>
                        )
                      )}
                      
                      {/* 渲染 pending blocks 骨架屏 */}
                      {pendingBlocks.length > 0 && (
                        <div className="mt-1 space-y-2.5">
                          {pendingBlocks.map((pending) => (
                            <BlockSkeleton key={pending.id} type={pending.type} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {/* 加载动画 - 只在没有 AI 消息时显示 */}
        {isLoading &&
          (() => {
            const lastMessage = messages[messages.length - 1];
            const shouldShowLoading = !lastMessage || lastMessage.role !== 'assistant';
            if (!shouldShowLoading) return null;

            return (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={MESSAGE_TRANSITION}
                className="flex w-full justify-start gap-3.5 py-4 md:gap-5 md:py-5"
              >
                <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-accent via-indigo-500 to-purple-600 p-[1.5px] shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-accent/10 animate-pulse-subtle" />
                    <Bot className="w-5 h-5 text-white relative z-10" />
                  </div>
                </div>
                <div className="mt-3 flex min-h-7 flex-1 items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                </div>
              </motion.div>
            );
          })()}
      </div>
    </div>
  );
}
