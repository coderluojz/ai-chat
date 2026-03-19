# AI Chat - Monorepo

这是一个使用 pnpm monorepo 架构构建的 AI Chat 应用，包含 Next.js 前端和 NestJS 后端。

## 项目结构

```
ai-chat/
├── apps/
│   ├── client/          # Next.js 前端应用
│   └── server/          # NestJS 后端服务
├── pnpm-workspace.yaml  # pnpm 工作空间配置
└── package.json         # 根 package.json
```

## 技术栈

- **前端**: Next.js 14, React 18, TypeScript
- **后端**: NestJS, TypeORM
- **包管理**: pnpm

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

启动所有服务：

```bash
pnpm dev
```

这将同时启动：
- 前端服务: http://localhost:3000
- 后端服务: http://localhost:3001

### 构建项目

```bash
pnpm build
```

### 运行生产环境

```bash
pnpm start
```

## 环境配置

前端和后端都包含 `.gitignore` 文件，确保敏感信息不会提交到代码仓库。

### 注意事项

- 项目已经初始化并安装了所有必要的依赖
- 前端使用 Next.js App Router
- 后端使用 TypeORM（暂未配置数据库）
- 默认端口：前端 3000，后端 3001

## 项目名称规范

本项目遵循 monorepo 项目命名规范：

- **根项目**: `@ai-chat/app`
- **前端应用**: `@ai-chat/client`
- **后端服务**: `@ai-chat/server`

## 下一步开发

1. 配置后端数据库（可选）
2. 创建 API 路由
3. 添加前端 UI 组件
4. 实现聊天功能
5. 集成 AI API（如 OpenAI 等）