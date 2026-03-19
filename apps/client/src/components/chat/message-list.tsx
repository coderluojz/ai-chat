'use client'

import { useScrollToBottom } from '@/lib/hooks/use-scroll-to-bottom'
import { Bot, Copy } from 'lucide-react'
import { useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

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
  const { handleScroll } = useScrollToBottom(scrollRef, messages, isLoading)

  if (messages.length === 0) return null

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto px-4 md:px-6"
    >
      <div className="flex flex-col w-full max-w-6xl mx-auto pb-54">
        {messages.map((message) => (
          <div
            key={message.id}
            className="group relative flex w-full max-w-6xl mx-auto py-6"
          >
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
                  <div className="inline-block px-5 py-4 rounded-2xl bubble-ai shadow-lg">
                    <div className="prose prose-neutral prose-sm max-w-none prose-p:leading-relaxed prose-p:my-1 prose-headings:my-2 prose-pre:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 text-foreground/95">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight, rehypeRaw]}
                        components={{
                          code({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }: any) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                              <div className="group/code relative my-2 rounded-xl overflow-hidden shadow-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950">
                                <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-800/50 border-b border-white/5 backdrop-blur-sm">
                                  <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2.5 py-1 rounded-lg font-mono tracking-wide">
                                    {match[1]}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <div className="flex gap-1.5 mr-2">
                                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/60"></span>
                                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></span>
                                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/60"></span>
                                    </div>
                                    <button
                                      onClick={() =>
                                        navigator.clipboard.writeText(
                                          String(children).replace(
                                            /<[^>]*>/g,
                                            '',
                                          ),
                                        )
                                      }
                                      className="text-zinc-400 hover:text-white transition-all duration-200 p-1.5 rounded-lg hover:bg-white/10 cursor-pointer opacity-0 group-hover/code:opacity-100"
                                      title="复制代码"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <div className="p-4 overflow-x-auto text-zinc-100 font-mono leading-relaxed text-[13px] custom-scrollbar">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </div>
                              </div>
                            ) : (
                              <code
                                className="px-2 py-1 rounded-md text-[13px] font-mono font-medium bg-[#fff5f5] border text-[#ff502c]"
                                {...props}
                              >
                                {children}
                              </code>
                            )
                          },
                          p({ children }) {
                            return (
                              <p className="mb-1 last:mb-0 leading-[1.6] text-foreground/95">
                                {children}
                              </p>
                            )
                          },
                          a({ href, children }) {
                            return (
                              <a
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4 decoration-indigo-400/30 hover:decoration-indigo-300 transition-all duration-200 cursor-pointer no-underline hover:underline"
                              >
                                {children}
                              </a>
                            )
                          },
                          blockquote({ children }) {
                            return (
                              <blockquote className="my-2 pl-3 border-l-3 border-indigo-500/30 bg-indigo-500/5 py-1.5 pr-3 rounded-r-lg text-foreground/80 italic">
                                {children}
                              </blockquote>
                            )
                          },
                          h1({ children }) {
                            return (
                              <h1 className="text-xl font-bold my-1.5! text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                                {children}
                              </h1>
                            )
                          },
                          h2({ children }) {
                            return (
                              <h2 className="text-lg font-semibold mt-2.5 mb-1 text-foreground/95">
                                {children}
                              </h2>
                            )
                          },
                          h3({ children }) {
                            return (
                              <h3 className="text-base font-semibold mt-2 mb-1 text-foreground/90">
                                {children}
                              </h3>
                            )
                          },
                          h4({ children }) {
                            return (
                              <h4 className="text-sm font-semibold mt-1.5 mb-0.5 text-foreground/85">
                                {children}
                              </h4>
                            )
                          },
                          h5({ children }) {
                            return (
                              <h5 className="text-sm font-semibold mt-1 mb-0.5 text-foreground/80">
                                {children}
                              </h5>
                            )
                          },
                          h6({ children }) {
                            return (
                              <h6 className="text-xs font-semibold mt-1 mb-0.5 text-foreground/75 uppercase tracking-wider">
                                {children}
                              </h6>
                            )
                          },
                          ul({ children }) {
                            return (
                              <ul className="my-1.5 pl-5 space-y-0.5 marker:text-indigo-500/60">
                                {children}
                              </ul>
                            )
                          },
                          ol({ children }) {
                            return (
                              <ol className="my-1.5 pl-5 space-y-0.5 marker:text-indigo-500/60 marker:font-semibold">
                                {children}
                              </ol>
                            )
                          },
                          li({ children }) {
                            return (
                              <li className="text-foreground/90 leading-relaxed">
                                {children}
                              </li>
                            )
                          },
                          strong({ children }) {
                            return (
                              <strong className="font-bold text-foreground/95">
                                {children}
                              </strong>
                            )
                          },
                          em({ children }) {
                            return (
                              <em className="italic text-foreground/80">
                                {children}
                              </em>
                            )
                          },
                          hr() {
                            return (
                              <hr className="my-3 border-t border-white/10" />
                            )
                          },
                          table({ children }) {
                            return (
                              <div className="my-2 overflow-x-auto rounded-lg border border-white/10">
                                <table className="w-full text-left border-collapse">
                                  {children}
                                </table>
                              </div>
                            )
                          },
                          thead({ children }) {
                            return (
                              <thead className="bg-zinc-800/30 border-b border-white/10">
                                {children}
                              </thead>
                            )
                          },
                          th({ children }) {
                            return (
                              <th className="px-4 py-2.5 font-semibold text-foreground/90 text-sm">
                                {children}
                              </th>
                            )
                          },
                          td({ children }) {
                            return (
                              <td className="px-4 py-2 text-foreground/80 text-sm border-b border-white/5">
                                {children}
                              </td>
                            )
                          },
                          tr({ children }) {
                            return (
                              <tr className="hover:bg-white/3 transition-colors">
                                {children}
                              </tr>
                            )
                          },
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
        ))}
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
