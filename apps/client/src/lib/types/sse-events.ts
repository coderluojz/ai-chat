import type { UIBlock } from './block';

/**
 * SSE 事件类型定义
 * 后端通过 SSE 发送以下事件，前端据此组装 blocks
 */

export enum SSEEventType {
  /** 文本流式增量 */
  TEXT_DELTA = 'text_delta',
  /** Block 开始生成 */
  BLOCK_START = 'block_start',
  /** 完整 Block 就绪（图片/卡片/图表等） */
  BLOCK_COMPLETE = 'block_complete',
  /** 流结束 */
  DONE = 'done',
  /** 错误 */
  ERROR = 'error',
}

/** 文本增量事件 */
export interface TextDeltaEvent {
  type: SSEEventType.TEXT_DELTA;
  blockId: string;
  content: string;
}

/** Block 开始事件 */
export interface BlockStartEvent {
  type: SSEEventType.BLOCK_START;
  blockId: string;
  blockType: string;
}

/** 完整 Block 事件 */
export interface BlockCompleteEvent {
  type: SSEEventType.BLOCK_COMPLETE;
  block: UIBlock;
}

/** 错误事件 */
export interface ErrorEvent {
  type: SSEEventType.ERROR;
  message: string;
}

/** 所有 SSE 事件的联合类型 */
export type SSEEvent = TextDeltaEvent | BlockStartEvent | BlockCompleteEvent | ErrorEvent;
