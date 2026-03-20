'use client';

import type { CodeBlockContent } from '@/lib/types/block';
import { CodeFrame } from './code-frame';

interface CodeBlockProps {
  content: CodeBlockContent;
}

export function CodeBlock({ content }: CodeBlockProps) {
  return (
    <CodeFrame
      code={content.code}
      language={content.language}
      filename={content.filename}
      className="w-full"
    >
      <pre className="font-mono">
        <code>{content.code}</code>
      </pre>
    </CodeFrame>
  );
}
