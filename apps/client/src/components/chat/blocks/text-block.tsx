'use client';

import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import type { TextBlockContent } from '@/lib/types/block';
import { CodeFrame } from './code-frame';

interface TextBlockProps {
  content: TextBlockContent;
}

export function TextBlock({ content }: TextBlockProps) {
  return (
    <div className="prose prose-neutral prose-sm max-w-none prose-p:leading-relaxed prose-p:my-1 prose-headings:my-2 prose-pre:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 text-foreground/95">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <CodeFrame
                code={String(children).replace(/<[^>]*>/g, '')}
                language={match[1]}
              >
                <code className={className} {...props}>
                  {children}
                </code>
              </CodeFrame>
            ) : (
              <code
                className="rounded-md border border-white/12 bg-slate-900/75 px-1.5 py-0.5 font-mono text-[13px] font-medium text-zinc-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                {...props}
              >
                {children}
              </code>
            );
          },
          p({ children }) {
            return (
              <p className="mb-1 last:mb-0 leading-[1.6] text-foreground/95">
                {children}
              </p>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-indigo-300 underline decoration-indigo-300/25 underline-offset-4 transition-all duration-200 hover:text-indigo-200 hover:decoration-indigo-200/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-sm"
              >
                {children}
              </a>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="my-3 rounded-r-xl border-l-[3px] border-indigo-400/40 bg-indigo-500/8 py-2 pr-3 pl-4 text-foreground/80 italic">
                {children}
              </blockquote>
            );
          },
          h1({ children }) {
            return (
              <h1 className="text-xl font-bold my-1.5! text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-lg font-semibold mt-2.5 mb-1 text-foreground/95">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-base font-semibold mt-2 mb-1 text-foreground/90">
                {children}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="text-sm font-semibold mt-1.5 mb-0.5 text-foreground/85">
                {children}
              </h4>
            );
          },
          h5({ children }) {
            return (
              <h5 className="text-sm font-semibold mt-1 mb-0.5 text-foreground/80">
                {children}
              </h5>
            );
          },
          h6({ children }) {
            return (
              <h6 className="text-xs font-semibold mt-1 mb-0.5 text-foreground/75 uppercase tracking-wider">
                {children}
              </h6>
            );
          },
          ul({ children }) {
            return (
              <ul className="my-1.5 pl-5 space-y-0.5 marker:text-indigo-500/60">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="my-1.5 pl-5 space-y-0.5 marker:text-indigo-500/60 marker:font-semibold">
                {children}
              </ol>
            );
          },
          li({ children }) {
            return (
              <li className="text-foreground/90 leading-relaxed">{children}</li>
            );
          },
          strong({ children }) {
            return (
              <strong className="font-bold text-foreground/95">
                {children}
              </strong>
            );
          },
          em({ children }) {
            return <em className="italic text-foreground/80">{children}</em>;
          },
          hr() {
            return <hr className="my-3 border-t border-white/10" />;
          },
          table({ children }) {
            return (
              <div className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03]">
                <table className="w-full text-left border-collapse">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="border-b border-white/10 bg-white/[0.04]">
                {children}
              </thead>
            );
          },
          th({ children }) {
            return (
              <th className="px-4 py-2.5 font-semibold text-foreground/90 text-sm">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border-b border-white/5 px-4 py-2.5 text-sm text-foreground/80">
                {children}
              </td>
            );
          },
          tr({ children }) {
            return (
              <tr className="transition-colors odd:bg-white/[0.015] hover:bg-white/[0.04]">{children}</tr>
            );
          },
        }}
      >
        {content.text}
      </ReactMarkdown>
    </div>
  );
}
