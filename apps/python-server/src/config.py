"""应用配置管理"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置"""

    # 应用配置
    APP_ENV: str = "development"
    PORT: int = 3002

    # Supabase 配置
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # JWT 配置
    JWT_SECRET: str = "your-super-secret-jwt-key-at-least-32-chars"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRES_IN: int = 15  # 分钟

    # OpenAI / LangChain 配置
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # CORS 配置
    CORS_ORIGIN: str = "http://localhost:3000"

    # 前端地址
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
