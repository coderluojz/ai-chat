"""HTTP 异常定义"""

from typing import Any, Optional


class AppException(Exception):
    """应用基础异常"""

    def __init__(
        self,
        status_code: int,
        message: str,
        data: Optional[Any] = None,
    ):
        self.status_code = status_code
        self.message = message
        self.data = data
        super().__init__(message)


class UnauthorizedException(AppException):
    """未授权异常"""

    def __init__(self, message: str = "未授权访问"):
        super().__init__(status_code=401, message=message)


class ForbiddenException(AppException):
    """禁止访问异常"""

    def __init__(self, message: str = "无权访问"):
        super().__init__(status_code=403, message=message)


class NotFoundException(AppException):
    """资源不存在异常"""

    def __init__(self, message: str = "资源不存在"):
        super().__init__(status_code=404, message=message)


class BadRequestException(AppException):
    """请求错误异常"""

    def __init__(self, message: str = "请求参数错误"):
        super().__init__(status_code=400, message=message)


class ConflictException(AppException):
    """冲突异常"""

    def __init__(self, message: str = "资源冲突"):
        super().__init__(status_code=409, message=message)
