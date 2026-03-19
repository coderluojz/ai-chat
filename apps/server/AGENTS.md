# NestJS Tech Stack & Preferences

- 框架与语言：NestJS + TypeScript
- 核心规范：严格遵守 NestJS 的模块化架构 (Controller -> Service -> Module)。
- 数据校验：强制使用 `class-validator` 和 `class-transformer` 处理所有 DTO (Data Transfer Object)。
- 数据库与 ORM：使用 Prisma (或你指定的 ORM)，AI 需协助编写高效、安全的查询，并妥善处理数据库关系。
- 核心 AI 框架：强制使用 `langchain` 及其现代核心库 (`langchain-core`, `langchain-openai` 等)。
- 复杂工作流：在构建涉及状态管理、多 Agent 协作或循环逻辑的复杂应用时，必须使用 `langgraph`，而非传统的 LangChain AgentExecutor。

# LangChain.js Coding Standards

- **工具与类型**：在定义 LangChain Tools 时，强制使用 `zod` 进行参数的 Schema 校验，确保大模型输出的结构化数据完全符合 TypeScript 类型。
- **流式响应封装**：
  - 在 Controller 中提供流式接口时，优先使用 NestJS 的 `@Sse()` 装饰器，并结合 `RxJS` 将 LangChain 的可读流 (ReadableStream) 转换为前端所需的 Server-Sent Events 格式。
- **工程化抽象**：
  - 鼓励使用设计模式处理复杂的 AI 业务流程。在生成代码时，主动解释如何在 NestJS 的生命周期中优雅地管理大模型的会话状态和内存。

# Backend Architecture (Strictly Enforced)

- **禁止跨层调用**：Controller 只能处理 HTTP 请求与响应，绝不能包含业务逻辑；业务逻辑必须全部放在 Service 层。
- **枚举与状态**：数据库状态字段、错误码、业务标识必须使用 TypeScript `enum`，严禁在后端代码中硬编码。
- **统一响应格式**：所有的 API 接口必须返回统一的 JSON 结构（例如 `{ code: number, data: any, message: string }`），遇到错误时使用 NestJS 自带的 Exception Filters 统一拦截处理。
- **依赖注入**：充分利用 NestJS 的依赖注入 (DI) 特性，保持代码的解耦和可测试性。
