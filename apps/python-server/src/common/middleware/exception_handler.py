"""全局异常处理器"""

from datetime import datetime, timezone

from fastapi import Request
from fastapi.responses import JSONResponse

from ..exceptions.http_exceptions import AppException


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """处理应用异常"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.status_code,
            "message": exc.message,
            "data": exc.data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "path": str(request.url.path),
        },
    )


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """处理全局异常"""
    return JSONResponse(
        status_code=500,
        content={
            "code": 500,
            "message": "服务器内部错误",
            "data": None,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "path": str(request.url.path),
        },
    )
