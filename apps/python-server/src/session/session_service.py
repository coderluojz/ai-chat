"""Session 服务"""

from datetime import datetime, timezone
from typing import Any, List, Optional

from ..common.enums.message_role import MessageRole
from ..common.exceptions.http_exceptions import ForbiddenException, NotFoundException
from ..supabase.client import SupabaseDBService
from .dto.session_dto import MessageResponse, SessionResponse


class SessionService:
    """会话服务"""

    @staticmethod
    async def find_all(user_id: str) -> List[SessionResponse]:
        """获取用户的所有会话"""
        try:
            sessions = await SupabaseDBService.select(
                table="sessions",
                filters={"user_id": user_id},
                order="updated_at",
                ascending=False,
            )

            return [
                SessionResponse(
                    id=session["id"],
                    title=session["title"],
                    created_at=session["created_at"],
                    updated_at=session["updated_at"],
                )
                for session in sessions
            ]
        except Exception:
            return []

    @staticmethod
    async def create(user_id: str, title: Optional[str] = None) -> SessionResponse:
        """创建会话"""
        try:
            now = datetime.now(timezone.utc).isoformat()
            session_data = {
                "user_id": user_id,
                "title": title or "新对话",
                "created_at": now,
                "updated_at": now,
            }

            session = await SupabaseDBService.insert("sessions", session_data)

            if not session:
                raise Exception("创建会话失败")

            return SessionResponse(
                id=session["id"],
                title=session["title"],
                created_at=session["created_at"],
                updated_at=session["updated_at"],
            )
        except Exception as e:
            raise Exception(f"创建会话失败: {str(e)}")

    @staticmethod
    async def update(user_id: str, session_id: str, title: str) -> SessionResponse:
        """更新会话"""
        try:
            # 验证会话所有权
            is_owner = await SessionService.verify_ownership(user_id, session_id)
            if not is_owner:
                raise ForbiddenException("无权修改此会话")

            now = datetime.now(timezone.utc).isoformat()
            session = await SupabaseDBService.update(
                "sessions",
                data={"title": title, "updated_at": now},
                filters={"id": session_id},
            )

            if not session:
                raise NotFoundException("会话不存在")

            return SessionResponse(
                id=session["id"],
                title=session["title"],
                created_at=session["created_at"],
                updated_at=session["updated_at"],
            )
        except (ForbiddenException, NotFoundException):
            raise
        except Exception as e:
            raise Exception(f"更新会话失败: {str(e)}")

    @staticmethod
    async def remove(user_id: str, session_id: str) -> dict:
        """删除会话"""
        try:
            # 验证会话所有权
            is_owner = await SessionService.verify_ownership(user_id, session_id)
            if not is_owner:
                raise ForbiddenException("无权删除此会话")

            # 先删除会话下的所有消息
            await SupabaseDBService.delete("messages", filters={"session_id": session_id})

            # 再删除会话
            await SupabaseDBService.delete("sessions", filters={"id": session_id})

            return {"success": True}
        except ForbiddenException:
            raise
        except Exception as e:
            raise Exception(f"删除会话失败: {str(e)}")

    @staticmethod
    async def get_messages(user_id: str, session_id: str) -> List[MessageResponse]:
        """获取会话消息"""
        try:
            # 验证会话所有权
            is_owner = await SessionService.verify_ownership(user_id, session_id)
            if not is_owner:
                raise ForbiddenException("无权访问此会话")

            messages = await SupabaseDBService.select(
                table="messages",
                filters={"session_id": session_id},
                order="created_at",
                ascending=True,
            )

            return [
                MessageResponse(
                    id=msg["id"],
                    role=msg["role"],
                    content=msg["content"],
                    blocks=msg.get("blocks", []),
                    created_at=msg.get("created_at"),
                )
                for msg in messages
            ]
        except ForbiddenException:
            raise
        except Exception:
            return []

    @staticmethod
    async def add_message(
        user_id: str, 
        session_id: str, 
        role: MessageRole, 
        content: str,
        blocks: Optional[List[Any]] = None,
    ) -> MessageResponse:
        """添加消息"""
        try:
            # 验证会话所有权
            is_owner = await SessionService.verify_ownership(user_id, session_id)
            if not is_owner:
                raise ForbiddenException("无权访问此会话")

            now = datetime.now(timezone.utc).isoformat()
            message_data = {
                "session_id": session_id,
                "role": role.value,
                "content": content,
                "blocks": blocks or [],
                "created_at": now,
            }

            message = await SupabaseDBService.insert("messages", message_data)

            if not message:
                raise Exception("添加消息失败")

            # 更新会话的 updated_at
            await SupabaseDBService.update(
                "sessions",
                data={"updated_at": now},
                filters={"id": session_id},
            )

            return MessageResponse(
                id=message["id"],
                role=message["role"],
                content=message["content"],
                blocks=message.get("blocks", []),
                created_at=message.get("created_at"),
            )
        except ForbiddenException:
            raise
        except Exception as e:
            raise Exception(f"添加消息失败: {str(e)}")

    @staticmethod
    async def verify_ownership(user_id: str, session_id: str) -> bool:
        """验证会话所有权"""
        try:
            sessions = await SupabaseDBService.select(
                table="sessions",
                columns="user_id",
                filters={"id": session_id},
            )

            if not sessions:
                return False

            return sessions[0]["user_id"] == user_id
        except Exception:
            return False
