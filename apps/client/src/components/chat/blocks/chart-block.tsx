'use client';

import { BarChart3 } from 'lucide-react';
import type { ChartBlockContent } from '@/lib/types/block';
import { BlockCaption, BlockHeader, BlockShell } from './block-shell';

interface ChartBlockProps {
  content: ChartBlockContent;
}

/** 简易 CSS 柱状图（无需额外图表库） */
function SimpleBarChart({
  data,
  xKey,
  yKey,
}: {
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
}) {
  const values = data.map((d) => Number(d[yKey]) || 0);
  const max = Math.max(...values, 1);

  return (
    <div className="space-y-2.5">
      {data.map((item, index) => {
        const value = Number(item[yKey]) || 0;
        const percentage = (value / max) * 100;
        return (
          <div key={index} className="grid grid-cols-[minmax(0,88px)_1fr] items-center gap-3">
            <span className="truncate text-right text-xs text-zinc-400">
              {String(item[xKey])}
            </span>
            <div className="h-7 overflow-hidden rounded-full border border-white/[0.06] bg-white/[0.07]">
              <div
                className="flex h-full items-center justify-end rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 pr-2 transition-all duration-700 ease-out"
                style={{ width: `${Math.max(percentage, 8)}%` }}
              >
                <span className="text-[10px] font-semibold text-white/95">
                  {value}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** 简易 CSS 饼图 */
function SimplePieChart({
  data,
  xKey,
  yKey,
}: {
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
}) {
  const values = data.map((d) => Number(d[yKey]) || 0);
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const colors = [
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
  ];

  let cumulativePercent = 0;
  const segments = data.map((item, index) => {
    const value = Number(item[yKey]) || 0;
    const percent = (value / total) * 100;
    const start = cumulativePercent;
    cumulativePercent += percent;
    return {
      label: String(item[xKey]),
      value,
      percent,
      color: colors[index % colors.length],
      start,
      end: cumulativePercent,
    };
  });

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div
        className="relative h-32 w-32 shrink-0 rounded-full self-center"
        style={{
          background: `conic-gradient(${segments
            .map(
              (s) =>
                `${s.color} ${s.start * 3.6}deg ${s.end * 3.6}deg`,
            )
            .join(', ')})`,
        }}
      >
        <div className="absolute inset-6 flex items-center justify-center rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))] backdrop-blur-md">
          <span className="text-xs font-medium text-zinc-100">{total}</span>
        </div>
      </div>
      <div className="min-w-0 space-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg px-1 py-0.5">
            <div
              className="h-3 w-3 rounded-full"
              style={{ background: s.color }}
            />
            <span className="text-xs text-foreground/80">
              {s.label}: {s.value} ({s.percent.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartBlock({ content }: ChartBlockProps) {
  const xKey = content.xKey || 'name';
  const yKey = content.yKey || 'value';

  const renderChart = () => {
    switch (content.chartType) {
      case 'bar':
      case 'area':
        return <SimpleBarChart data={content.data} xKey={xKey} yKey={yKey} />;
      case 'pie':
        return <SimplePieChart data={content.data} xKey={xKey} yKey={yKey} />;
      case 'line':
        // 折线图用柱状图替代（简化实现）
        return <SimpleBarChart data={content.data} xKey={xKey} yKey={yKey} />;
      default:
        return <SimpleBarChart data={content.data} xKey={xKey} yKey={yKey} />;
    }
  };

  return (
    <BlockShell className="max-w-2xl">
      <BlockHeader
        icon={<BarChart3 className="h-4 w-4" />}
        title={content.title || '数据图表'}
        description={`${content.chartType.toUpperCase()} · ${content.data.length} 项数据`}
      />
      <div className="p-4">{renderChart()}</div>
      {content.description && <BlockCaption>{content.description}</BlockCaption>}
    </BlockShell>
  );
}
