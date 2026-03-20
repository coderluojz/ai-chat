"""UIBlock 类型定义"""

from enum import Enum
from typing import Any, Optional, Union

from pydantic import BaseModel


class BlockType(str, Enum):
    """Block 类型"""

    TEXT = "text"
    IMAGE = "image"
    CARD = "card"
    CHART = "chart"
    CODE = "code"
    TABLE = "table"


class TextBlockContent(BaseModel):
    """文本 Block 内容"""

    text: str


class ImageBlockContent(BaseModel):
    """图片 Block 内容"""

    url: str
    alt: Optional[str] = None
    caption: Optional[str] = None


class CardBlockAction(BaseModel):
    """卡片操作按钮"""

    label: str
    url: Optional[str] = None
    variant: Optional[str] = None


class CardBlockContent(BaseModel):
    """卡片 Block 内容"""

    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    actions: Optional[list[CardBlockAction]] = None


class ChartBlockContent(BaseModel):
    """图表 Block 内容"""

    chart_type: str
    title: Optional[str] = None
    data: list[dict[str, Any]]
    x_key: Optional[str] = None
    y_key: Optional[str] = None
    description: Optional[str] = None


class CodeBlockContent(BaseModel):
    """代码 Block 内容"""

    code: str
    language: Optional[str] = None
    filename: Optional[str] = None


class TableBlockContent(BaseModel):
    """表格 Block 内容"""

    headers: list[str]
    rows: list[list[str]]
    caption: Optional[str] = None


BlockContent = Union[
    TextBlockContent,
    ImageBlockContent,
    CardBlockContent,
    ChartBlockContent,
    CodeBlockContent,
    TableBlockContent,
    dict[str, Any],
]


class UIBlock(BaseModel):
    """通用 UIBlock 接口"""

    id: str
    type: BlockType
    content: BlockContent
