"""Session 路由"""

from typing import Annotated, List

from fastapi import APIRouter, Depends

from ..auth.jwt_auth import CurrentUser, get_current_user
from .dto.session_dto import CreateSessionDto, UpdateSessionDto
from .session_service import SessionService

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("")
async def find_all(current_user: Annotated[CurrentUser, Depends(get_current_user)]):
    """获取所有会话"""
    result = await SessionService.find_all(current_user.sub)
    return [session.model_dump() for session in result]


@router.post("")
async def create(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    body: CreateSessionDto,
):
    """创建会话"""
    result = await SessionService.create(current_user.sub, body.title)
    return result.model_dump()


@router.patch("/{session_id}")
async def update(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    session_id: str,
    body: UpdateSessionDto,
):
    """更新会话"""
    result = await SessionService.update(current_user.sub, session_id, body.title)
    return result.model_dump()


@router.delete("/{session_id}")
async def remove(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    session_id: str,
):
    """删除会话"""
    result = await SessionService.remove(current_user.sub, session_id)
    return result


@router.get("/{session_id}/messages")
async def get_messages(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    session_id: str,
):
    """获取会话消息"""
    result = await SessionService.get_messages(current_user.sub, session_id)
    return [msg.model_dump() for msg in result]
