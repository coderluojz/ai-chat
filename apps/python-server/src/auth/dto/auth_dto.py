"""Auth 数据传输对象"""

from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class RegisterDto(BaseModel):
    """注册请求"""

    email: EmailStr = Field(..., description="邮箱地址")
    password: str = Field(..., min_length=6, description="密码，至少6位")
    name: Optional[str] = Field(None, description="用户名")


class LoginDto(BaseModel):
    """登录请求"""

    email: EmailStr = Field(..., description="邮箱地址")
    password: str = Field(..., description="密码")


class ForgotPasswordDto(BaseModel):
    """忘记密码请求"""

    email: EmailStr = Field(..., description="邮箱地址")


class ResetPasswordDto(BaseModel):
    """重置密码请求"""

    token: str = Field(..., description="重置令牌")
    new_password: str = Field(..., min_length=6, description="新密码，至少6位")


class ChangePasswordDto(BaseModel):
    """修改密码请求"""

    current_password: str = Field(..., description="当前密码")
    new_password: str = Field(..., min_length=6, description="新密码，至少6位")


class UserResponse(BaseModel):
    """用户响应"""

    id: str
    email: str
    name: str
    created_at: Optional[str] = None


class AuthResponse(BaseModel):
    """认证响应"""

    user: UserResponse
    access_token: str
