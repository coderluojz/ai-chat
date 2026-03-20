"""JWT 认证依赖"""

from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .auth_service import AuthService

security = HTTPBearer()


@dataclass
class CurrentUser:
    """当前用户信息"""

    sub: str  # user ID


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> CurrentUser:
    """获取当前用户"""
    try:
        token = credentials.credentials
        user_id = AuthService.verify_token(token)
        return CurrentUser(sub=user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证令牌",
            headers={"WWW-Authenticate": "Bearer"},
        )
