"""Supabase 客户端服务"""

import logging
from typing import Any, Dict, Optional

import httpx

from ..config import settings

logger = logging.getLogger(__name__)


class SupabaseService:
    """Supabase 服务类 - 使用 httpx 直接调用 API"""

    @classmethod
    def _get_headers(cls) -> Dict[str, str]:
        """获取请求头"""
        return {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
        }

    @classmethod
    async def sign_up(cls, email: str, password: str, name: Optional[str] = None) -> Dict[str, Any]:
        """注册用户"""
        url = f"{settings.SUPABASE_URL}/auth/v1/signup"
        data: Dict[str, Any] = {"email": email, "password": password}
        if name:
            data["data"] = {"name": name}
        
        async with httpx.AsyncClient(verify=True, timeout=30.0) as client:
            response = await client.post(url, headers=cls._get_headers(), json=data)
            response.raise_for_status()
            return response.json()

    @classmethod
    async def sign_in(cls, email: str, password: str) -> Dict[str, Any]:
        """登录用户"""
        url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password"
        data = {"email": email, "password": password}
        
        logger.info(f"调用 Supabase sign_in: {email}")
        
        async with httpx.AsyncClient(verify=True, timeout=30.0) as client:
            response = await client.post(url, headers=cls._get_headers(), json=data)
            response.raise_for_status()
            result = response.json()
            logger.info(f"Supabase sign_in 成功: user_id={result.get('user', {}).get('id')}")
            return result

    @classmethod
    async def get_user(cls, access_token: str) -> Dict[str, Any]:
        """获取用户信息"""
        url = f"{settings.SUPABASE_URL}/auth/v1/user"
        headers = cls._get_headers()
        headers["Authorization"] = f"Bearer {access_token}"
        
        async with httpx.AsyncClient(verify=True, timeout=30.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()

    @classmethod
    async def reset_password_for_email(cls, email: str) -> Dict[str, Any]:
        """发送重置密码邮件"""
        url = f"{settings.SUPABASE_URL}/auth/v1/recover"
        data = {"email": email, "redirect_to": f"{settings.FRONTEND_URL}/reset-password"}
        
        async with httpx.AsyncClient(verify=True, timeout=30.0) as client:
            response = await client.post(url, headers=cls._get_headers(), json=data)
            response.raise_for_status()
            return {"message": "重置密码邮件已发送"}

    @classmethod
    async def update_user(cls, access_token: str, attributes: Dict[str, Any]) -> Dict[str, Any]:
        """更新用户信息"""
        url = f"{settings.SUPABASE_URL}/auth/v1/user"
        headers = cls._get_headers()
        headers["Authorization"] = f"Bearer {access_token}"
        
        async with httpx.AsyncClient(verify=True, timeout=30.0) as client:
            response = await client.put(url, headers=headers, json=attributes)
            response.raise_for_status()
            return response.json()


class SupabaseDBService:
    """Supabase 数据库服务 - 使用 PostgREST API"""

    @classmethod
    def _get_headers(cls, access_token: Optional[str] = None) -> Dict[str, str]:
        """获取请求头"""
        headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        if access_token:
            headers["Authorization"] = f"Bearer {access_token}"
        else:
            headers["Authorization"] = f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}"
        return headers

    @classmethod
    async def select(
        cls, 
        table: str, 
        columns: str = "*",
        filters: Optional[Dict[str, Any]] = None,
        order: Optional[str] = None,
        ascending: bool = True,
    ) -> list:
        """查询数据"""
        url = f"{settings.SUPABASE_URL}/rest/v1/{table}"
        params = {"select": columns}
        
        if filters:
            for key, value in filters.items():
                params[key] = f"eq.{value}"
        
        if order:
            params["order"] = f"{order}.{'asc' if ascending else 'desc'}"
        
        async with httpx.AsyncClient(verify=True, timeout=30.0) as client:
            response = await client.get(url, headers=cls._get_headers(), params=params)
            response.raise_for_status()
            return response.json()

    @classmethod
    async def insert(cls, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """插入数据"""
        url = f"{settings.SUPABASE_URL}/rest/v1/{table}"
        
        async with httpx.AsyncClient(verify=True, timeout=30.0) as client:
            response = await client.post(url, headers=cls._get_headers(), json=data)
            response.raise_for_status()
            result = response.json()
            return result[0] if result else {}

    @classmethod
    async def update(
        cls, 
        table: str, 
        data: Dict[str, Any],
        filters: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """更新数据"""
        url = f"{settings.SUPABASE_URL}/rest/v1/{table}"
        params = {}
        
        if filters:
            for key, value in filters.items():
                params[key] = f"eq.{value}"
        
        async with httpx.AsyncClient(verify=True, timeout=30.0) as client:
            response = await client.patch(url, headers=cls._get_headers(), json=data, params=params)
            response.raise_for_status()
            result = response.json()
            return result[0] if result else {}

    @classmethod
    async def delete(
        cls, 
        table: str,
        filters: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """删除数据"""
        url = f"{settings.SUPABASE_URL}/rest/v1/{table}"
        params = {}
        
        if filters:
            for key, value in filters.items():
                params[key] = f"eq.{value}"
        
        async with httpx.AsyncClient(verify=True, timeout=30.0) as client:
            response = await client.delete(url, headers=cls._get_headers(), params=params)
            response.raise_for_status()
            return True
