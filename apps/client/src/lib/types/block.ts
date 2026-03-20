/**
 * UIBlock 类型系统
 * 支持 Generative UI 的多模态 Block 渲染
 */

export enum BlockType {
  TEXT = 'text',
  IMAGE = 'image',
  CARD = 'card',
  CHART = 'chart',
  CODE = 'code',
  TABLE = 'table',
  FALLBACK = 'fallback',
}

/** 文本 Block */
export interface TextBlockContent {
  text: string;
}

/** 图片 Block */
export interface ImageBlockContent {
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

/** 卡片 Block */
export interface CardBlockContent {
  title: string;
  description?: string;
  imageUrl?: string;
  actions?: Array<{ label: string; url?: string; variant?: 'primary' | 'secondary' }>;
}

/** 图表 Block */
export interface ChartBlockContent {
  chartType: 'bar' | 'line' | 'pie' | 'area';
  title?: string;
  data: Array<Record<string, unknown>>;
  xKey?: string;
  yKey?: string;
  description?: string;
}

/** 代码 Block */
export interface CodeBlockContent {
  code: string;
  language?: string;
  filename?: string;
}

/** 表格 Block */
export interface TableBlockContent {
  headers: string[];
  rows: string[][];
  caption?: string;
}

/** 通用 UIBlock 接口 */
export interface UIBlock {
  id: string;
  type: BlockType;
  content:
    | TextBlockContent
    | ImageBlockContent
    | CardBlockContent
    | ChartBlockContent
    | CodeBlockContent
    | TableBlockContent
    | Record<string, unknown>;
}

/** 类型守卫 */
export function isTextBlock(block: UIBlock): block is UIBlock & { content: TextBlockContent } {
  return block.type === BlockType.TEXT;
}

export function isImageBlock(block: UIBlock): block is UIBlock & { content: ImageBlockContent } {
  return block.type === BlockType.IMAGE;
}

export function isCardBlock(block: UIBlock): block is UIBlock & { content: CardBlockContent } {
  return block.type === BlockType.CARD;
}

export function isChartBlock(block: UIBlock): block is UIBlock & { content: ChartBlockContent } {
  return block.type === BlockType.CHART;
}

export function isCodeBlock(block: UIBlock): block is UIBlock & { content: CodeBlockContent } {
  return block.type === BlockType.CODE;
}

export function isTableBlock(block: UIBlock): block is UIBlock & { content: TableBlockContent } {
  return block.type === BlockType.TABLE;
}
