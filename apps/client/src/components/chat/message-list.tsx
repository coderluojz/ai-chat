'use client'

import { Bot, Copy } from 'lucide-react'
import { useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { useScrollToBottom } from '@/lib/hooks/use-scroll-to-bottom'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type MessageListProps = {
  messages: Message[]
  isLoading?: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { handleScroll } = useScrollToBottom(scrollRef, messages.length)

  if (messages.length === 0) return null

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto px-4 md:px-6"
    >
      <div className="flex flex-col w-full max-w-6xl mx-auto pb-54">
        {
          messages.map((message) => (
            <div key={message.id} className="group relative flex w-full max-w-6xl mx-auto py-6">
              {message.role === 'user' ? (
                <div className="flex w-full justify-end">
                  <div className="px-5 py-3 rounded-3xl bubble-user max-w-[85%] text-[15px] leading-relaxed break-words font-medium">
                    {message.content}
                  </div>
                </div>
              ) : (
                <div className="flex w-full justify-start gap-4 md:gap-6 group/assistant">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-accent via-indigo-500 to-purple-600 p-[1.5px] shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover/assistant:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-500">
                      <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden relative">
                        <div className="absolute inset-0 bg-accent/10 animate-pulse-subtle" />
                        <Bot className="w-5 h-5 text-white relative z-10" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="inline-block px-4 py-2.5 rounded-2xl bubble-ai shadow-lg transition-all duration-500 hover:shadow-primary/5">
                      <div className="prose prose-neutral prose-sm md:prose-base dark:prose-invert max-w-none prose-p:leading-normal prose-p:my-1.5 prose-headings:my-2 prose-pre:my-2 prose-ul:my-1 prose-li:my-0.5 text-foreground/90">
                        <ReactMarkdown
                          // ... 保持原有代码 ...
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight, rehypeRaw]}
                          components={{
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '')
                              return !inline && match ? (
                                <div className="relative my-4 rounded-xl border border-border/40 bg-zinc-950 overflow-hidden text-[13px] shadow-lg">
                                  <div className="flex items-center px-4 py-2 border-b border-white/10 bg-white/5">
                                    <span className="text-xs text-zinc-400 font-mono font-medium">{match[1]}</span>
                                    <div className="ml-auto flex items-center gap-2">
                                      <button className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-md hover:bg-white/5 cursor-pointer">
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="p-4 overflow-x-auto text-zinc-200 font-mono leading-relaxed">
                                    <code className={className} {...props}>{children}</code>
                                  </div>
                                </div>
                              ) : (
                                <code className="bg-muted px-1.5 py-0.5 rounded-md text-[13px] font-mono font-medium border border-border/30" {...props}>
                                  {children}
                                </code>
                              )
                            },
                            p({ children }) {
                              return <p className="mb-1.5 last:mb-0 leading-[1.8]">{children}</p>
                            },
                            a({ href, children }) {
                              return (
                                <a href={href} target="_blank" rel="noreferrer" className="text-primary font-medium underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all cursor-pointer">
                                  {children}
                                </a>
                              )
                            },
                            blockquote({ children }) {
                              return (
                                <blockquote className="border-l-4 border-primary/20 pl-4 italic text-muted-foreground my-4">
                                  {children}
                                </blockquote>
                              )
                            }
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        }
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex w-full justify-start gap-4 md:gap-6 py-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-accent via-indigo-500 to-purple-600 p-[1.5px] shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover/assistant:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-500">
              <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-accent/10 animate-pulse-subtle" />
                <Bot className="w-5 h-5 text-white relative z-10" />
              </div>
            </div>
            <div className="flex-1 flex gap-1.5 items-center mt-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
