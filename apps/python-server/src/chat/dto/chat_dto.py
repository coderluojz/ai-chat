"""Chat 数据传输对象"""

from typing import Optional

from pydantic import BaseModel, Field

from ...common.enums.message_role import MessageRole


class HistoryMessageDto(BaseModel):
    """历史消息"""

    role: MessageRole = Field(..., description="消息角色")
    content: str = Field(..., description="消息内容")


class ChatCompletionsDto(BaseModel):
    """聊天补全请求"""

    message: str = Field(..., min_length=1, description="消息内容")
    session_id: Optional[str] = Field(None, description="会话 ID")
    history: Optional[list[HistoryMessageDto]] = Field(None, description="历史消息")
