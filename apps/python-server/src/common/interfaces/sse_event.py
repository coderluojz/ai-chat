"""SSE 事件类型定义"""

from enum import Enum
from typing import Any, Union

from pydantic import BaseModel


class SSEEventType(str, Enum):
    """SSE 事件类型"""

    TEXT_DELTA = "text_delta"
    BLOCK_COMPLETE = "block_complete"
    DONE = "done"
    ERROR = "error"


class TextDeltaSSEEvent(BaseModel):
    """文本增量事件 - 用于流式文本输出"""

    type: SSEEventType = SSEEventType.TEXT_DELTA
    block_id: str
    content: str


class BlockCompleteSSEEvent(BaseModel):
    """完整 Block 事件 - 用于工具调用产生的结构化内容"""

    type: SSEEventType = SSEEventType.BLOCK_COMPLETE
    block: dict[str, Any]


class DoneSSEEvent(BaseModel):
    """完成事件"""

    type: SSEEventType = SSEEventType.DONE


class ErrorSSEEvent(BaseModel):
    """错误事件"""

    type: SSEEventType = SSEEventType.ERROR
    message: str


SSEEvent = Union[TextDeltaSSEEvent, BlockCompleteSSEEvent, DoneSSEEvent, ErrorSSEEvent]
