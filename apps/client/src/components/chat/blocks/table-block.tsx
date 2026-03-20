'use client';

import { Table2 } from 'lucide-react';
import type { TableBlockContent } from '@/lib/types/block';
import { BlockCaption, BlockHeader, BlockShell } from './block-shell';

interface TableBlockProps {
  content: TableBlockContent;
}

export function TableBlock({ content }: TableBlockProps) {
  return (
    <BlockShell className="max-w-3xl">
      <BlockHeader
        icon={<Table2 className="h-4 w-4" />}
        title="数据表"
        description={`${content.headers.length} 列 · ${content.rows.length} 行`}
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[440px] text-left border-collapse">
          <thead className="border-b border-white/10 bg-white/[0.06]">
            <tr>
              {content.headers.map((header, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-sm font-semibold text-foreground/90"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {content.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-white/5 transition-colors odd:bg-white/[0.025] hover:bg-white/[0.06] last:border-b-0"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-2.5 text-sm leading-6 text-foreground/80"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {content.caption && <BlockCaption className="pt-3">{content.caption}</BlockCaption>}
    </BlockShell>
  );
}
