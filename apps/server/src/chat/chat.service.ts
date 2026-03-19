import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { IterableReadableStream } from "@langchain/core/utils/stream";

@Injectable()
export class ChatService {
  private model: ChatOpenAI;

  constructor(private configService: ConfigService) {
    this.model = new ChatOpenAI({
      modelName:
        this.configService.get<string>("LLM_MODEL_NAME") || "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 2000,
      apiKey: this.configService.get<string>("LLM_API_KEY") || "fake-key",
      configuration: {
        baseURL:
          this.configService.get<string>("LLM_BASE_URL") ||
          "https://api.openai.com/v1",
      },
    });
  }

  async streamChat(
    message: string,
    history: any[] = []
  ): Promise<IterableReadableStream<any>> {
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
      history: history,
    });
  }
}
