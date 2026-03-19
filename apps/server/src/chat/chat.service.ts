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
      maxTokens: 2000,
      apiKey,
      configuration: baseUrl ? { baseURL: baseUrl } : undefined,
    });

    this.logger.log(`ChatOpenAI 初始化成功，模型: ${modelName}`);
  }

  async streamChat(
    message: string,
    history: [string, string][] = [],
  ): Promise<IterableReadableStream<BaseMessage>> {
    const historyMessages = createHistoryMessages(history);

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "你是一个有帮助的 AI 助手。请用简洁清晰的方式回答问题，支持 Markdown 格式。默认使用中文回答。",
      ],
      new MessagesPlaceholder("history"),
      ["human", "{input}"],
    ]);

    const chain = prompt.pipe(this.model);

    return await chain.stream({
      input: message,
      history: historyMessages,
    });
  }
}
