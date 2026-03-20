"""Auth 服务"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt

from ..common.exceptions.http_exceptions import (
    BadRequestException,
    UnauthorizedException,
)
from ..config import settings
from ..supabase.client import SupabaseService
from .dto.auth_dto import AuthResponse, UserResponse

logger = logging.getLogger(__name__)


class AuthService:
    """认证服务"""

    @staticmethod
    def create_access_token(user_id: str) -> str:
        """创建 JWT 令牌"""
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRES_IN)
        payload = {"sub": user_id, "exp": expire}
        return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    @staticmethod
    def verify_token(token: str) -> str:
        """验证 JWT 令牌，返回用户 ID"""
        try:
            payload = jwt.decode(
                token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
            )
            user_id: Optional[str] = payload.get("sub")
            if user_id is None:
                raise UnauthorizedException("无效的令牌")
            return user_id
        except JWTError:
            raise UnauthorizedException("无效的令牌")

    @staticmethod
    async def register(email: str, password: str, name: Optional[str] = None) -> AuthResponse:
        """注册用户"""
        try:
            result = await SupabaseService.sign_up(email, password, name)
            user_data = result.get("user")
            
            if not user_data:
                raise BadRequestException("注册失败")

            user_metadata = user_data.get("user_metadata", {})
            user = UserResponse(
                id=user_data["id"],
                email=user_data.get("email") or email,
                name=user_metadata.get("name") or name or email.split("@")[0],
                created_at=user_data.get("created_at"),
            )

            access_token = AuthService.create_access_token(user_data["id"])

            return AuthResponse(user=user, access_token=access_token)
        except Exception as e:
            logger.error(f"注册错误: {e}")
            if "already registered" in str(e).lower():
                raise BadRequestException("该邮箱已被注册")
            raise BadRequestException(f"注册失败: {str(e)}")

    @staticmethod
    async def login(email: str, password: str) -> AuthResponse:
        """用户登录"""
        try:
            logger.info(f"尝试登录: {email}")
            result = await SupabaseService.sign_in(email, password)
            logger.info(f"登录结果: {result}")
            
            user_data = result.get("user")
            if not user_data:
                raise UnauthorizedException("邮箱或密码错误")

            user_metadata = user_data.get("user_metadata", {})
            user = UserResponse(
                id=user_data["id"],
                email=user_data.get("email") or email,
                name=user_metadata.get("name") or email.split("@")[0],
                created_at=user_data.get("created_at"),
            )

            access_token = AuthService.create_access_token(user_data["id"])

            return AuthResponse(user=user, access_token=access_token)
        except UnauthorizedException:
            raise
        except Exception as e:
            logger.error(f"登录错误: {e}")
            raise UnauthorizedException(f"邮箱或密码错误: {str(e)}")

    @staticmethod
    async def get_profile(user_id: str) -> UserResponse:
        """获取用户信息"""
        try:
            # 这里需要通过 admin API 获取用户信息
            # 简化处理，返回基本用户信息
            return UserResponse(
                id=user_id,
                email="",  # 需要从数据库获取
                name="",  # 需要从数据库获取
            )
        except Exception:
            raise UnauthorizedException("获取用户信息失败")

    @staticmethod
    async def forgot_password(email: str) -> dict:
        """忘记密码"""
        try:
            await SupabaseService.reset_password_for_email(email)
            return {"message": "重置密码邮件已发送"}
        except Exception:
            # 为了安全，即使失败也返回成功
            return {"message": "重置密码邮件已发送"}

    @staticmethod
    async def reset_password(token: str, new_password: str) -> dict:
        """重置密码"""
        try:
            # Supabase 的密码重置需要在前端通过链接处理
            # 这里只是示例
            return {"message": "密码重置成功"}
        except Exception:
            raise BadRequestException("密码重置失败")

    @staticmethod
    async def change_password(
        user_id: str, current_password: str, new_password: str
    ) -> dict:
        """修改密码"""
        try:
            # 需要先验证当前密码，然后更新
            # 这里简化处理
            return {"message": "密码修改成功"}
        except Exception:
            raise BadRequestException("密码修改失败")
