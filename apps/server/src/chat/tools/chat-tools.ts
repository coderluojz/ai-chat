import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * LangChain 工具定义
 * AI 通过调用这些工具来"插入"结构化 UI Block
 */

/** 渲染图片工具 */
export const renderImageTool = tool(
  async (input) => {
    return JSON.stringify({
      type: "image",
      content: {
        url: input.url,
        alt: input.alt || "",
        caption: input.caption || "",
      },
    });
  },
  {
    name: "render_image",
    description:
      "在回复中插入一张图片。当你需要展示图片、图表截图、示意图或任何视觉内容时使用此工具。",
    schema: z.object({
      url: z.string().describe("图片的 URL 地址"),
      alt: z.string().optional().describe("图片的替代文本描述"),
      caption: z.string().optional().describe("图片下方的说明文字"),
    }),
  },
);

/** 渲染卡片工具 */
export const renderCardTool = tool(
  async (input) => {
    return JSON.stringify({
      type: "card",
      content: {
        title: input.title,
        description: input.description || "",
        imageUrl: input.imageUrl || "",
        actions: input.actions || [],
      },
    });
  },
  {
    name: "render_card",
    description:
      "在回复中插入一张信息卡片。当你需要展示产品信息、摘要、推荐内容或任何结构化信息时使用此工具。",
    schema: z.object({
      title: z.string().describe("卡片标题"),
      description: z.string().optional().describe("卡片描述文字"),
      imageUrl: z.string().optional().describe("卡片封面图片 URL"),
      actions: z
        .array(
          z.object({
            label: z.string().describe("按钮文字"),
            url: z.string().optional().describe("点击跳转的链接"),
            variant: z
              .enum(["primary", "secondary"])
              .optional()
              .describe("按钮样式"),
          }),
        )
        .optional()
        .describe("卡片上的操作按钮列表"),
    }),
  },
);

/** 渲染图表工具 */
export const renderChartTool = tool(
  async (input) => {
    return JSON.stringify({
      type: "chart",
      content: {
        chartType: input.chartType,
        title: input.title || "",
        data: input.data,
        xKey: input.xKey || "name",
        yKey: input.yKey || "value",
        description: input.description || "",
      },
    });
  },
  {
    name: "render_chart",
    description:
      "在回复中插入一个数据图表。当你需要可视化数据、展示趋势或比较数值时使用此工具。",
    schema: z.object({
      chartType: z.enum(["bar", "line", "pie", "area"]).describe("图表类型"),
      title: z.string().optional().describe("图表标题"),
      data: z
        .array(z.record(z.unknown()))
        .describe("图表数据数组，每项是一个包含维度和度量的对象"),
      xKey: z.string().optional().describe("X 轴对应的字段名"),
      yKey: z.string().optional().describe("Y 轴对应的字段名"),
      description: z.string().optional().describe("图表的说明文字"),
    }),
  },
);

/** 渲染代码块工具 */
export const renderCodeTool = tool(
  async (input) => {
    return JSON.stringify({
      type: "code",
      content: {
        code: input.code,
        language: input.language || "text",
        filename: input.filename || "",
      },
    });
  },
  {
    name: "render_code",
    description:
      "在回复中插入一个格式化的代码块。当你需要展示代码示例、配置文件或任何技术内容时使用此工具。",
    schema: z.object({
      code: z.string().describe("代码内容"),
      language: z
        .string()
        .optional()
        .describe("编程语言，如 javascript, python, typescript 等"),
      filename: z.string().optional().describe("文件名"),
    }),
  },
);

/** 渲染表格工具 */
export const renderTableTool = tool(
  async (input) => {
    return JSON.stringify({
      type: "table",
      content: {
        headers: input.headers,
        rows: input.rows,
        caption: input.caption || "",
      },
    });
  },
  {
    name: "render_table",
    description:
      "在回复中插入一个数据表格。当你需要展示对比数据、列表或任何行列结构化数据时使用此工具。",
    schema: z.object({
      headers: z.array(z.string()).describe("表头列名数组"),
      rows: z
        .array(z.array(z.string()))
        .describe("表格数据，每行是一个字符串数组"),
      caption: z.string().optional().describe("表格标题或说明"),
    }),
  },
);

/** 所有可用工具的集合 */
export const chatTools: Array<{
  name: string;
  invoke: (input: unknown) => Promise<string>;
}> = [
  renderImageTool,
  renderCardTool,
  renderChartTool,
  renderCodeTool,
  renderTableTool,
];

/** 工具名称到工具对象的映射 */
export const toolMap = Object.fromEntries(chatTools.map((t) => [t.name, t]));
