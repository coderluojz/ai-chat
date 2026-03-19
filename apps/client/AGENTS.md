# Frontend Tech Stack & Preferences

- 框架与语言：React (或 Next.js) + TypeScript
- 全局状态管理：强制使用 `zustand`。禁止使用 Redux 或 Context API 处理复杂状态。
- 数据请求与流处理：
  - 标准 HTTP 请求封装：使用 `axios` 封装通用方法复用。
  - 数据获取、缓存与状态同步：强制使用 `@tanstack/react-query`。
  - AI 对话/流式数据接收：强制使用 `@microsoft/fetch-event-source` 处理 SSE。
- 样式与动画：
  - CSS 方案：Tailwind CSS。
  - 类名合并：强制使用基于 `clsx` 和 `tailwind-merge` 封装的工具函数（如 `cn()`）。
  - 动画库：强制使用 `framer-motion`。
- 实用工具库：
  - 日期处理：强制使用 `dayjs`，禁止使用 moment.js。
  - 数据处理：按需引入 `lodash-es` 的具体方法（如 `import { cloneDeep } from 'lodash-es'`）。
  - React Hooks：优先使用 `ahooks` 中的成熟方案，避免重复造轮子。

# Architecture & Patterns

- **逻辑分离**：UI 组件尽量保持纯粹。复杂的业务逻辑必须抽离到 Custom Hooks 或 Zustand Store 中。
- **API 层**：将所有的 axios 请求统一封装在 `src/api/{name}.ts` 或类似目录下，不在组件内直接发起原生请求。
- **Query 封装**：将所有的 TanStack Query 逻辑（useQuery/useMutation）封装在业务模块下独立的 `queries.ts` 文件中，不要直接写在 UI 组件里。
