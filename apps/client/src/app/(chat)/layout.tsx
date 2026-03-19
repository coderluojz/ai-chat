'use client';

import ChatLayout from '@/components/chat/chat-layout';

/**
 * (chat) Route Group 的共享布局
 * ChatLayout 在此渲染一次，在 / 和 /chat/[id] 之间切换时不会被销毁重建
 * 这样可以避免会话列表闪烁和重复请求接口的问题
 */
export default function ChatGroupLayout({ children }: { children: React.ReactNode }) {
  return <ChatLayout>{children}</ChatLayout>;
}
