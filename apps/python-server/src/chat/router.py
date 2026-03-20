"""Chat 路由"""

import logging
from typing import Annotated, List, Tuple

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse

from ..auth.jwt_auth import CurrentUser, get_current_user
from ..common.enums.message_role import MessageRole
from ..common.exceptions.http_exceptions import ForbiddenException
from ..session.session_service import SessionService
from .chat_service import ChatService
from .dto.chat_dto import ChatCompletionsDto

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

# 创建全局 ChatService 实例
chat_service = ChatService()


@router.post("/completions")
async def completions(
    request: Request,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    body: ChatCompletionsDto,
):
    """流式聊天补全"""
    user_id = current_user.sub
    session_id = body.session_id

    # 验证会话所有权并保存用户消息
    if session_id:
        is_owner = await SessionService.verify_ownership(user_id, session_id)
        if not is_owner:
            raise ForbiddenException("无权访问此会话")

        await SessionService.add_message(user_id, session_id, MessageRole.USER, body.message)

    # 构建对话历史
    history: List[Tuple[str, str]] = []
    if body.history:
        history = [(h.role.value, h.content) for h in body.history]
    elif session_id:
        messages = await SessionService.get_messages(user_id, session_id)
        past_messages = messages[:-1] if messages else []
        history = [(msg.role, msg.content) for msg in past_messages]

    # 生成事件流
    async def event_generator():
        full_content = ""
        collected_blocks: list = []
        text_block_id = None
        try:
            async for event in chat_service.stream_chat_with_tools(body.message, history):
                # 检查客户端是否断开连接
                if await request.is_disconnected():
                    logger.info("客户端断开连接")
                    break

                # 提取事件数据用于保存
                if event.startswith("data: "):
                    data_str = event[6:].strip()
                    if data_str == "[DONE]":
                        # 构建最终的 blocks
                        final_blocks = []
                        if full_content:
                            final_blocks.append({
                                "id": text_block_id or "text-1",
                                "type": "text",
                                "content": {"text": full_content}
                            })
                        final_blocks.extend(collected_blocks)
                        
                        # 保存完整消息到数据库
                        if session_id and (full_content or collected_blocks):
                            try:
                                await SessionService.add_message(
                                    user_id, session_id, MessageRole.ASSISTANT, 
                                    full_content, final_blocks
                                )
                            except Exception as e:
                                logger.error(f"保存消息失败: {e}")
                    elif data_str:
                        try:
                            import json

                            data = json.loads(data_str)
                            event_type = data.get("type")
                            
                            if event_type == "text_delta":
                                full_content += data.get("content", "")
                                if not text_block_id:
                                    text_block_id = data.get("blockId")
                            elif event_type == "block_complete":
                                block = data.get("block")
                                if block:
                                    collected_blocks.append(block)
                        except json.JSONDecodeError:
                            pass

                yield event

        except Exception as e:
            logger.error(f"聊天流生成错误: {e}")
            import json

            error_event = {"type": "error", "message": "流生成过程发生错误"}
            yield f"data: {json.dumps(error_event)}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Content-Type": "text/event-stream",
        },
    )
