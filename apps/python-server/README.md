# AI Chat Python Server

基于 FastAPI + LangChain 的 AI 聊天后端服务，是 NestJS 版本的 Python 等效实现。

## 技术栈

- **框架**: FastAPI
- **AI 框架**: LangChain + OpenAI
- **数据库**: Supabase (PostgreSQL)
- **认证**: JWT (python-jose)
- **数据校验**: Pydantic v2
- **服务器**: Uvicorn

## 项目结构

```
python-server/
├── main.py                 # 应用主入口
├── pyproject.toml          # 项目配置和依赖
├── .env.example            # 环境变量示例
├── .gitignore              # Git 忽略文件
└── src/
    ├── config.py           # 配置管理
    ├── auth/               # 认证模块
    │   ├── router.py       # 路由
    │   ├── auth_service.py # 服务
    │   ├── jwt_auth.py     # JWT 认证
    │   └── dto/            # 数据传输对象
    ├── chat/               # 聊天模块
    │   ├── router.py       # 路由
    │   ├── chat_service.py # LangChain 服务
    │   ├── dto/            # 数据传输对象
    │   └── tools/          # LangChain 工具
    ├── session/            # 会话模块
    │   ├── router.py       # 路由
    │   ├── session_service.py # 服务
    │   └── dto/            # 数据传输对象
    ├── supabase/           # Supabase 客户端
    │   └── client.py       # 客户端服务
    └── common/             # 公共模块
        ├── enums/          # 枚举定义
        ├── interfaces/     # 接口定义
        ├── middleware/     # 中间件
        └── exceptions/     # 异常定义
```

## 快速开始

### 1. 安装依赖

```bash
# 使用 uv (推荐)
uv sync

# 或使用 pip
pip install -e .
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入正确的配置
```

### 3. 启动服务

```bash
# 开发模式
python main.py

# 或使用 uvicorn
uvicorn main:app --host 0.0.0.0 --port 3002 --reload
```

## API 接口

### Auth 模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/auth/register` | 用户注册 | 否 |
| POST | `/auth/login` | 用户登录 | 否 |
| GET | `/auth/me` | 获取当前用户 | 是 |
| POST | `/auth/forgot-password` | 忘记密码 | 否 |
| POST | `/auth/reset-password` | 重置密码 | 否 |
| PUT | `/auth/change-password` | 修改密码 | 是 |

### Session 模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/sessions` | 获取所有会话 | 是 |
| POST | `/sessions` | 创建会话 | 是 |
| PATCH | `/sessions/:id` | 更新会话 | 是 |
| DELETE | `/sessions/:id` | 删除会话 | 是 |
| GET | `/sessions/:id/messages` | 获取会话消息 | 是 |

### Chat 模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/chat/completions` | 流式聊天 | 是 |

## 与前端的兼容性

本 Python 服务器完全兼容现有前端，所有 API 接口格式与 NestJS 版本一致：

- 统一响应格式: `{ code: number, message: string, data: any, timestamp: string }`
- SSE 事件格式: `text_delta`, `block_complete`, `error`, `[DONE]`
- JWT 认证方式: `Bearer {token}`

## 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| APP_ENV | 应用环境 | `development` |
| PORT | 服务端口 | `3002` |
| SUPABASE_URL | Supabase URL | - |
| SUPABASE_SERVICE_ROLE_KEY | Supabase 密钥 | - |
| JWT_SECRET | JWT 密钥 | - |
| JWT_ALGORITHM | JWT 算法 | `HS256` |
| JWT_EXPIRES_IN | JWT 过期时间(分钟) | `15` |
| OPENAI_API_KEY | OpenAI API 密钥 | - |
| OPENAI_BASE_URL | OpenAI 基础 URL | - |
| OPENAI_MODEL | OpenAI 模型 | `gpt-4o-mini` |
| CORS_ORIGIN | CORS 来源 | `http://localhost:3000` |
