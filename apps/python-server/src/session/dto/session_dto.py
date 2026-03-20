"""Session 数据传输对象"""

from typing import Any, List, Optional

from pydantic import BaseModel, Field


class CreateSessionDto(BaseModel):
    """创建会话请求"""

    title: Optional[str] = Field(None, description="会话标题")


class UpdateSessionDto(BaseModel):
    """更新会话请求"""

    title: str = Field(..., description="会话标题")


class SessionResponse(BaseModel):
    """会话响应"""

    id: str
    title: str
    created_at: str
    updated_at: str


class MessageResponse(BaseModel):
    """消息响应"""

    id: str
    role: str
    content: str
    blocks: Optional[List[Any]] = Field(default_factory=list)
    created_at: Optional[str] = None
