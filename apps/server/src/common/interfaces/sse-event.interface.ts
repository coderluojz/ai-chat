import { UIBlock } from "./ui-block.interface";

/**
 * SSE 事件类型枚举
 */
export enum SSEEventType {
  TEXT_DELTA = "text_delta",
  BLOCK_COMPLETE = "block_complete",
  DONE = "done",
  ERROR = "error",
}

/** 文本增量事件 - 用于流式文本输出 */
export interface TextDeltaSSEEvent {
  type: SSEEventType.TEXT_DELTA;
  blockId: string;
  content: string;
}

/** 完整 Block 事件 - 用于工具调用产生的结构化内容 */
export interface BlockCompleteSSEEvent {
  type: SSEEventType.BLOCK_COMPLETE;
  block: UIBlock;
}

/** 完成事件 */
export interface DoneSSEEvent {
  type: SSEEventType.DONE;
}

/** 错误事件 */
export interface ErrorSSEEvent {
  type: SSEEventType.ERROR;
  message: string;
}

/** SSE 事件联合类型 */
export type SSEEvent =
  | TextDeltaSSEEvent
  | BlockCompleteSSEEvent
  | DoneSSEEvent
  | ErrorSSEEvent;
