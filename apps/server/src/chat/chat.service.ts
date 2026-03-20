import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { IterableReadableStream } from "@langchain/core/utils/stream";
import { ChatOpenAI } from "@langchain/openai";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MessageRole } from "../common/enums/message-role.enum";
import { BlockType, UIBlock } from "../common/interfaces/ui-block.interface";
import { chatTools } from "./tools/chat-tools";
import { randomUUID } from "crypto";

const createHistoryMessages = (
  history: [string, string][],
): (HumanMessage | AIMessage)[] => {
  return history.map(([role, content]) => {
    const messageRole = role as MessageRole;
    if (messageRole === MessageRole.USER) {
      return new HumanMessage({ content });
    }
    return new AIMessage({ content });
  });
};

const SYSTEM_PROMPT = `你是一个有帮助的 AI 助手。请用简洁清晰的方式回答问题，支持 Markdown 格式。默认使用中文回答。

你可以使用以下工具来增强你的回复，让你的回答更加丰富和可视化：
- render_image: 插入图片
- render_card: 插入信息卡片
- render_chart: 插入数据图表
- render_code: 插入格式化代码块
- render_table: 插入数据表格

使用规则：
1. 当你需要展示图片、图表、代码、表格或结构化信息时，使用对应的工具
2. 文字解释和工具调用可以混合使用，让回答更丰富
3. 工具调用的结果会作为独立的内容块展示给用户
4. 不要过度使用工具，只在确实需要可视化展示时才使用`;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private model: ChatOpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");
    const baseUrl = this.configService.get<string>("OPENAI_BASE_URL");
    const modelName = this.configService.get<string>(
      "OPENAI_MODEL",
      "gpt-4o-mini",
    );

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY 环境变量未配置");
    }

    this.model = new ChatOpenAI({
      modelName,
      temperature: 0.7,
      maxTokens: 4000,
      apiKey,
      configuration: baseUrl ? { baseURL: baseUrl } : undefined,
    });

    this.logger.log(
      `ChatOpenAI 初始化成功，模型: ${modelName}，可用 ${chatTools.length} 个工具`,
    );
  }

  /**
   * 返回 LangChain 原生流式对象，控制器负责逐块消费
   */
  async streamChat(
    message: string,
    history: [string, string][] = [],
  ): Promise<IterableReadableStream<BaseMessage>> {
    const historyMessages = createHistoryMessages(history);

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_PROMPT],
      new MessagesPlaceholder("history"),
      ["human", "{input}"],
    ]);

    // 避免 LangChain 工具链的复杂泛型在 watch 模式下卡住 TypeScript 编译
    const boundModel = this.model.bindTools(
      chatTools as Parameters<ChatOpenAI["bindTools"]>[0],
    );
    const chain = prompt.pipe(boundModel);

    return await chain.stream({
      input: message,
      history: historyMessages,
    });
  }

  /**
   * 执行工具调用，将结果转换为 UIBlock 返回给控制器
   */
  async executeToolCalls(
    toolCalls: Array<{
      id: string;
      name: string;
      args: Record<string, unknown>;
    }>,
  ): Promise<UIBlock[]> {
    const blocks: UIBlock[] = [];

    for (const tc of toolCalls) {
      try {
        const tool = chatTools.find((t) => t.name === tc.name);
        if (!tool) {
          this.logger.warn(`未知工具: ${tc.name}`);
          continue;
        }

        // 执行工具
        const result = await (
          tool as { invoke: (input: unknown) => Promise<string> }
        ).invoke(tc.args);

        // 解析工具返回的 Block JSON
        const blockData = JSON.parse(result) as {
          type: string;
          content: unknown;
        };

        const block: UIBlock = {
          id: randomUUID(),
          type: blockData.type as BlockType,
          content: blockData.content as UIBlock["content"],
        };

        blocks.push(block);
      } catch (err) {
        this.logger.error(`工具执行失败: ${tc.name}`, err);
      }
    }

    return blocks;
  }
}
