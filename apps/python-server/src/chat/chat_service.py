"""Chat 服务 - 使用 LangChain 实现流式聊天"""

import json
import logging
import uuid
from collections.abc import AsyncGenerator
from typing import List, Tuple, Union, Dict, Any, Optional

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI

from ..common.enums.message_role import MessageRole
from ..config import settings
from .tools.chat_tools import chat_tools

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """# Role
你是一个专业的 AI 助手。你的核心任务是通过结构化的数据格式，提供简洁、清晰、高信息密度的中文回复。

# Core Objective
你必须严格按照提供的 Schema 格式输出响应。你的回复可以由连贯的文字解释和各种可视化组件（Components）组合而成，以提供最佳的阅读体验。

# Available Components
当你判断需要增强信息的可视化或结构化表达时，请使用对应的组件（仅限确有必要时）：
- `render_image`: 插入图片。仅用于需要展示具体实体、架构或视觉辅助说明时。
- `render_card`: 插入信息卡片。用于突出显示核心结论、关键概念或警告提示。
- `render_chart`: 插入数据图表。仅用于展示包含具体数值的趋势、对比或比例分析。
- `render_code`: 插入代码块。必须包含准确的语法高亮语言标识。
- `render_table`: 插入数据表格。用于展示多维度的属性对比或矩阵数据。

# Execution Rules
1. **结构优先**：严格遵守约定的输出格式。所有的组件调用必须作为独立的结构化对象返回，绝对不要在普通的纯文本字段中伪造或拼接组件标识符。
2. **逻辑连贯**：合理交替使用文本说明和可视化组件。文字负责上下文过渡和逻辑推理，组件负责直观展示。
3. **克制且精准**：不要过度包装。如果一段 Markdown 列表足以清晰表达，就不需要强行调用 `render_card` 或 `render_table`。
4. **语言要求**：所有面向用户的说明性文字、图表标题、卡片内容等，默认使用中文。"""


class ChatService:
    """聊天服务"""

    def __init__(self):
        """初始化 ChatOpenAI 模型"""
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY 环境变量未配置")

        self.model = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            temperature=0.7,
            max_tokens=4000,
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL if settings.OPENAI_BASE_URL else None,
            streaming=True,
        )

        # 绑定工具
        self.model_with_tools = self.model.bind_tools(chat_tools)

        logger.info(
            f"ChatOpenAI 初始化成功，模型: {settings.OPENAI_MODEL}，"
            f"已绑定 {len(chat_tools)} 个工具"
        )

    def _create_history_messages(
        self, history: List[Tuple[str, str]]
    ) -> List[Union[HumanMessage, AIMessage]]:
        """创建历史消息"""
        messages = []
        for role, content in history:
            if role == MessageRole.USER.value:
                messages.append(HumanMessage(content=content))
            else:
                messages.append(AIMessage(content=content))
        return messages

    async def stream_chat(
        self, message: str, history: List[Tuple[str, str]] = []
    ) -> AsyncGenerator[str, None]:
        """流式聊天 - 返回 SSE 格式的事件

        Yields:
            SSE 格式的字符串事件
        """
        try:
            history_messages = self._create_history_messages(history)

            prompt = ChatPromptTemplate.from_messages(
                [
                    ("system", SYSTEM_PROMPT),
                    MessagesPlaceholder(variable_name="history"),
                    ("human", "{input}"),
                ]
            )

            chain = prompt | self.model_with_tools

            text_block_id = str(uuid.uuid4())
            has_text_content = False
            tool_calls: List[Dict] = []

            # 流式处理
            async for chunk in chain.astream({"input": message, "history": history_messages}):
                # 处理文本内容
                content = chunk.content
                text_content = ""

                if isinstance(content, str):
                    text_content = content
                elif isinstance(content, list):
                    text_content = "".join(
                        c.get("text", "") for c in content if c.get("type") == "text"
                    )

                if text_content:
                    has_text_content = True
                    event = {
                        "type": "text_delta",
                        "blockId": text_block_id,
                        "content": text_content,
                    }
                    yield f"data: {json.dumps(event)}\n\n"

                # 收集工具调用
                if hasattr(chunk, "tool_call_chunks") and chunk.tool_call_chunks:
                    for tc in chunk.tool_call_chunks:
                        tc_id = tc.get("id")
                        tc_name = tc.get("name")
                        tc_args = tc.get("args", "")

                        if tc_id:
                            existing = next((t for t in tool_calls if t.get("id") == tc_id), None)
                            if existing:
                                # 合并增量参数
                                if tc_args:
                                    existing["args"] = existing.get("args", "") + tc_args
                            elif tc_name:
                                tool_calls.append({
                                    "id": tc_id,
                                    "name": tc_name,
                                    "args": tc_args,
                                })

            # 如果有工具调用，执行工具并发送 Block 事件
            if tool_calls:
                await self._execute_tool_calls(tool_calls)

            # 发送完成事件
            yield "data: [DONE]\n\n"

        except Exception as e:
            logger.error(f"流式聊天执行错误: {e}")
            error_event = {"type": "error", "message": str(e) or "AI 服务发生错误"}
            yield f"data: {json.dumps(error_event)}\n\n"
            yield "data: [DONE]\n\n"

    async def _execute_tool_calls(
        self, tool_calls: List[Dict]
    ) -> AsyncGenerator[str, None]:
        """执行工具调用，将结果转换为 UIBlock 发送给前端"""
        from .tools.chat_tools import tool_map

        for tc in tool_calls:
            try:
                tool_name = tc.get("name")
                tool_args = tc.get("args", "")

                if tool_name not in tool_map:
                    logger.warning(f"未知工具: {tool_name}")
                    continue

                # 解析工具参数
                if isinstance(tool_args, str):
                    try:
                        args = json.loads(tool_args) if tool_args else {}
                    except json.JSONDecodeError:
                        args = {}
                else:
                    args = tool_args

                # 执行工具
                tool_func = tool_map[tool_name]
                result = tool_func.invoke(args)

                # 解析工具返回的 Block JSON
                block_data = json.loads(result)
                block = {
                    "id": str(uuid.uuid4()),
                    "type": block_data["type"],
                    "content": block_data["content"],
                }

                event = {"type": "block_complete", "block": block}
                yield f"data: {json.dumps(event)}\n\n"

            except Exception as e:
                logger.error(f"工具执行失败: {tool_name}, 错误: {e}")

    async def stream_chat_with_tools(
        self, message: str, history: List[Tuple[str, str]] = []
    ) -> AsyncGenerator[str, None]:
        """流式聊天（包含工具执行）- 返回 SSE 格式的事件

        Yields:
            SSE 格式的字符串事件
        """
        try:
            history_messages = self._create_history_messages(history)

            prompt = ChatPromptTemplate.from_messages(
                [
                    ("system", SYSTEM_PROMPT),
                    MessagesPlaceholder(variable_name="history"),
                    ("human", "{input}"),
                ]
            )

            chain = prompt | self.model_with_tools

            text_block_id = str(uuid.uuid4())
            tool_calls: List[Dict] = []

            # 流式处理
            async for chunk in chain.astream({"input": message, "history": history_messages}):
                # 处理文本内容
                content = chunk.content
                text_content = ""

                if isinstance(content, str):
                    text_content = content
                elif isinstance(content, list):
                    text_content = "".join(
                        c.get("text", "") for c in content if c.get("type") == "text"
                    )

                if text_content:
                    event = {
                        "type": "text_delta",
                        "blockId": text_block_id,
                        "content": text_content,
                    }
                    yield f"data: {json.dumps(event)}\n\n"

                # 收集工具调用
                if hasattr(chunk, "tool_call_chunks") and chunk.tool_call_chunks:
                    for tc in chunk.tool_call_chunks:
                        tc_id = tc.get("id")
                        tc_name = tc.get("name")
                        tc_args = tc.get("args", "")

                        if tc_id:
                            existing = next((t for t in tool_calls if t.get("id") == tc_id), None)
                            if existing:
                                if tc_args:
                                    existing["args"] = existing.get("args", "") + tc_args
                            elif tc_name:
                                tool_calls.append({
                                    "id": tc_id,
                                    "name": tc_name,
                                    "args": tc_args,
                                })

            # 执行工具调用
            from .tools.chat_tools import tool_map

            for tc in tool_calls:
                try:
                    tool_name = tc.get("name")
                    tool_args = tc.get("args", "")

                    if tool_name not in tool_map:
                        continue

                    # 生成 block ID
                    block_id = str(uuid.uuid4())
                    
                    # 从工具名称映射到 block 类型
                    block_type_map = {
                        "render_image": "image",
                        "render_card": "card",
                        "render_chart": "chart",
                        "render_code": "code",
                        "render_table": "table",
                    }
                    block_type = block_type_map.get(tool_name, "text")
                    
                    # 1. 先发送 block_start 事件（前端显示骨架屏）
                    start_event = {
                        "type": "block_start",
                        "blockId": block_id,
                        "blockType": block_type,
                    }
                    yield f"data: {json.dumps(start_event)}\n\n"

                    # 2. 解析工具参数
                    if isinstance(tool_args, str):
                        try:
                            args = json.loads(tool_args) if tool_args else {}
                        except json.JSONDecodeError:
                            args = {}
                    else:
                        args = tool_args

                    # 3. 执行工具调用（这里可能耗时较长，如调用外部 API）
                    tool_func = tool_map[tool_name]
                    result = tool_func.invoke(args)

                    # 4. 解析结果
                    block_data = json.loads(result)
                    block = {
                        "id": block_id,
                        "type": block_data["type"],
                        "content": block_data["content"],
                    }

                    # 5. 发送 block_complete 事件（前端渲染实际内容，移除骨架屏）
                    event = {"type": "block_complete", "block": block}
                    yield f"data: {json.dumps(event)}\n\n"

                except Exception as e:
                    logger.error(f"工具执行失败: {tool_name}, 错误: {e}")

            yield "data: [DONE]\n\n"

        except Exception as e:
            logger.error(f"流式聊天执行错误: {e}")
            error_event = {"type": "error", "message": str(e) or "AI 服务发生错误"}
            yield f"data: {json.dumps(error_event)}\n\n"
            yield "data: [DONE]\n\n"
