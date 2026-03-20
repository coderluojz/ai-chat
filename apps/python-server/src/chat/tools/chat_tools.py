"""LangChain 工具定义"""

import json
from typing import Any, Optional, List, Dict

from langchain_core.tools import tool
from pydantic import BaseModel, Field


class RenderImageInput(BaseModel):
    """渲染图片工具输入"""

    url: str = Field(..., description="图片的 URL 地址")
    alt: Optional[str] = Field(None, description="图片的替代文本描述")
    caption: Optional[str] = Field(None, description="图片下方的说明文字")


class CardAction(BaseModel):
    """卡片操作按钮"""

    label: str = Field(..., description="按钮文字")
    url: Optional[str] = Field(None, description="点击跳转的链接")
    variant: Optional[str] = Field(None, description="按钮样式")


class RenderCardInput(BaseModel):
    """渲染卡片工具输入"""

    title: str = Field(..., description="卡片标题")
    description: Optional[str] = Field(None, description="卡片描述文字")
    imageUrl: Optional[str] = Field(None, description="卡片封面图片 URL")
    actions: Optional[List[CardAction]] = Field(None, description="卡片上的操作按钮列表")


class RenderChartInput(BaseModel):
    """渲染图表工具输入"""

    chartType: str = Field(..., description="图表类型: bar, line, pie, area")
    title: Optional[str] = Field(None, description="图表标题")
    data: List[Dict[str, Any]] = Field(
        ..., description="图表数据数组，每项是一个包含维度和度量的对象"
    )
    xKey: Optional[str] = Field(None, description="X 轴对应的字段名")
    yKey: Optional[str] = Field(None, description="Y 轴对应的字段名")
    description: Optional[str] = Field(None, description="图表的说明文字")


class RenderCodeInput(BaseModel):
    """渲染代码块工具输入"""

    code: str = Field(..., description="代码内容")
    language: Optional[str] = Field(None, description="编程语言，如 javascript, python 等")
    filename: Optional[str] = Field(None, description="文件名")


class RenderTableInput(BaseModel):
    """渲染表格工具输入"""

    headers: List[str] = Field(..., description="表头列名数组")
    rows: List[List[str]] = Field(..., description="表格数据，每行是一个字符串数组")
    caption: Optional[str] = Field(None, description="表格标题或说明")


@tool("render_image", args_schema=RenderImageInput)
def render_image(
    url: str, alt: Optional[str] = None, caption: Optional[str] = None
) -> str:
    """在回复中插入一张图片。当你需要展示图片、图表截图、示意图或任何视觉内容时使用此工具。"""
    return json.dumps(
        {
            "type": "image",
            "content": {"url": url, "alt": alt or "", "caption": caption or ""},
        }
    )


@tool("render_card", args_schema=RenderCardInput)
def render_card(
    title: str,
    description: Optional[str] = None,
    imageUrl: Optional[str] = None,
    actions: Optional[List[Dict[str, Any]]] = None,
) -> str:
    """在回复中插入一张信息卡片。当你需要展示产品信息、摘要、推荐内容或任何结构化信息时使用此工具。"""
    return json.dumps(
        {
            "type": "card",
            "content": {
                "title": title,
                "description": description or "",
                "imageUrl": imageUrl or "",
                "actions": actions or [],
            },
        }
    )


@tool("render_chart", args_schema=RenderChartInput)
def render_chart(
    chartType: str,
    data: List[Dict[str, Any]],
    title: Optional[str] = None,
    xKey: Optional[str] = None,
    yKey: Optional[str] = None,
    description: Optional[str] = None,
) -> str:
    """在回复中插入一个数据图表。当你需要可视化数据、展示趋势或比较数值时使用此工具。"""
    return json.dumps(
        {
            "type": "chart",
            "content": {
                "chartType": chartType,
                "title": title or "",
                "data": data,
                "xKey": xKey or "name",
                "yKey": yKey or "value",
                "description": description or "",
            },
        }
    )


@tool("render_code", args_schema=RenderCodeInput)
def render_code(
    code: str, language: Optional[str] = None, filename: Optional[str] = None
) -> str:
    """在回复中插入一个格式化的代码块。当你需要展示代码示例、配置文件或任何技术内容时使用此工具。"""
    return json.dumps(
        {
            "type": "code",
            "content": {
                "code": code,
                "language": language or "text",
                "filename": filename or "",
            },
        }
    )


@tool("render_table", args_schema=RenderTableInput)
def render_table(
    headers: List[str],
    rows: List[List[str]],
    caption: Optional[str] = None,
) -> str:
    """在回复中插入一个数据表格。当你需要展示对比数据、列表或任何行列结构化数据时使用此工具。"""
    return json.dumps(
        {
            "type": "table",
            "content": {"headers": headers, "rows": rows, "caption": caption or ""},
        }
    )


# 所有可用工具的列表
chat_tools = [render_image, render_card, render_chart, render_code, render_table]

# 工具名称到工具对象的映射
tool_map = {tool.name: tool for tool in chat_tools}
