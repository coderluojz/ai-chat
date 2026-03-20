"""FastAPI 应用主入口"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.auth.router import router as auth_router
from src.chat.router import router as chat_router
from src.common.exceptions.http_exceptions import AppException
from src.common.middleware.exception_handler import (
    app_exception_handler,
    global_exception_handler,
)
from src.config import settings
from src.session.router import router as session_router

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# 创建 FastAPI 应用
app = FastAPI(
    title="AI Chat Python Server",
    description="AI Chat 后端服务 - Python FastAPI + LangChain",
    version="0.1.0",
)

# CORS 配置
cors_origins = settings.CORS_ORIGIN.split(",") if settings.CORS_ORIGIN else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发环境允许所有来源
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# 注册异常处理器
app.add_exception_handler(AppException, app_exception_handler)  # type: ignore
app.add_exception_handler(Exception, global_exception_handler)  # type: ignore

# 注册路由
app.include_router(auth_router)
app.include_router(session_router)
app.include_router(chat_router)


@app.get("/")
async def root():
    """根路径"""
    return {
        "code": 200,
        "message": "AI Chat Python Server 运行中",
        "data": {"version": "0.1.0", "status": "running"},
    }


@app.get("/health")
async def health():
    """健康检查"""
    return {
        "code": 200,
        "message": "服务正常",
        "data": {"status": "healthy"},
    }


@app.on_event("startup")
async def startup_event():
    """应用启动事件"""
    logger.info(f"🚀 AI Chat Python Server 启动中...")
    logger.info(f"环境: {settings.APP_ENV}")
    logger.info(f"端口: {settings.PORT}")
    logger.info(f"CORS 来源: {settings.CORS_ORIGIN}")


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭事件"""
    logger.info("👋 AI Chat Python Server 正在关闭...")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.APP_ENV == "development",
        log_level="info",
    )
