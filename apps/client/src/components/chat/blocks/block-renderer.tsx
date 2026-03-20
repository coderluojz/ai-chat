'use client';

import React from 'react';
import { BlockType, type UIBlock } from '@/lib/types/block';
import { TextBlock } from './text-block';
import { ImageBlock } from './image-block';
import { CardBlock } from './card-block';
import { ChartBlock } from './chart-block';
import { CodeBlock } from './code-block';
import { TableBlock } from './table-block';
import { FallbackBlock } from './fallback-block';

type BlockComponent = React.ComponentType<{ content: unknown }>;

/**
 * 组件注册表 (Component Registry Pattern)
 * 将 Block 类型字符串映射到具体的 React 组件
 * 避免 if/else 或 switch/case 的面条式判断
 */
const COMPONENT_MAP: Record<string, BlockComponent> = {
  [BlockType.TEXT]: TextBlock as BlockComponent,
  [BlockType.IMAGE]: ImageBlock as BlockComponent,
  [BlockType.CARD]: CardBlock as BlockComponent,
  [BlockType.CHART]: ChartBlock as BlockComponent,
  [BlockType.CODE]: CodeBlock as BlockComponent,
  [BlockType.TABLE]: TableBlock as BlockComponent,
};

interface BlockRendererProps {
  block: UIBlock;
}

/**
 * 单个 Block 渲染器
 * 根据 block.type 查找注册表中的组件并渲染
 * 未注册的类型优雅降级为 Fallback
 */
export function BlockRenderer({ block }: BlockRendererProps) {
  const Component = COMPONENT_MAP[block.type];

  if (!Component) {
    return <FallbackBlock type={block.type} content={block.content} />;
  }

  return <Component content={block.content} />;
}

/**
 * 批量 Block 渲染器
 * 遍历 blocks 数组，依次渲染每个 Block
 */
interface BlockListRendererProps {
  blocks: UIBlock[];
}

export function BlockListRenderer({ blocks }: BlockListRendererProps) {
  return (
    <>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </>
  );
}
