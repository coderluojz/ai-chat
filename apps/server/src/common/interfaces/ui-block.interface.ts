/**
 * UIBlock 类型枚举与接口
 * 定义 AI 可生成的多模态内容块类型
 */

export enum BlockType {
  TEXT = "text",
  IMAGE = "image",
  CARD = "card",
  CHART = "chart",
  CODE = "code",
  TABLE = "table",
}

export interface TextBlockContent {
  text: string;
}

export interface ImageBlockContent {
  url: string;
  alt?: string;
  caption?: string;
}

export interface CardBlockContent {
  title: string;
  description?: string;
  imageUrl?: string;
  actions?: Array<{
    label: string;
    url?: string;
    variant?: "primary" | "secondary";
  }>;
}

export interface ChartBlockContent {
  chartType: "bar" | "line" | "pie" | "area";
  title?: string;
  data: Array<Record<string, unknown>>;
  xKey?: string;
  yKey?: string;
  description?: string;
}

export interface CodeBlockContent {
  code: string;
  language?: string;
  filename?: string;
}

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
    | TableBlockContent;
}
