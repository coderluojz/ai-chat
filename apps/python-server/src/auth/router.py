"""Auth 路由"""

from typing import Annotated

from fastapi import APIRouter, Depends

from .auth_service import AuthService
from .dto.auth_dto import (
    ChangePasswordDto,
    ForgotPasswordDto,
    LoginDto,
    RegisterDto,
    ResetPasswordDto,
)
from .jwt_auth import CurrentUser, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(body: RegisterDto):
    """注册"""
    result = await AuthService.register(body.email, body.password, body.name)
    return result.model_dump()


@router.post("/login")
async def login(body: LoginDto):
    """登录"""
    result = await AuthService.login(body.email, body.password)
    return result.model_dump()


@router.get("/me")
async def get_profile(current_user: Annotated[CurrentUser, Depends(get_current_user)]):
    """获取当前用户信息"""
    result = await AuthService.get_profile(current_user.sub)
    return result.model_dump()


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordDto):
    """忘记密码"""
    result = await AuthService.forgot_password(body.email)
    return result


@router.post("/reset-password")
async def reset_password(body: ResetPasswordDto):
    """重置密码"""
    result = await AuthService.reset_password(body.token, body.new_password)
    return result


@router.put("/change-password")
async def change_password(
    body: ChangePasswordDto,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
):
    """修改密码"""
    result = await AuthService.change_password(
        current_user.sub, body.current_password, body.new_password
    )
    return result
