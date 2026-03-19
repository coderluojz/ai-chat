import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { ChatService } from "./chat.service";
import { SessionService } from "../session/session.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ChatCompletionsDto } from "./dto/chat.dto";

@Controller("chat")
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly sessionService: SessionService
  ) {}

  @Post("completions")
  @UseGuards(JwtAuthGuard)
  async completions(
    @Request() req: any,
    @Body() body: ChatCompletionsDto,
    @Res() res: Response
  ) {
    const userId = req.user.sub;

    const sessionId = body.session_id;
    if (sessionId) {
      await this.sessionService.addMessage(sessionId, "user", body.message);
    }

    let history = body.history || [];
    if (sessionId && history.length === 0) {
      const messages = await this.sessionService.getMessages(userId, sessionId);
      const pastMessages = messages.slice(0, -1);
      history = pastMessages.map((m: any) => [m.role, m.content]);
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    // Flush response headers
    res.flushHeaders();

    const stream = await this.chatService.streamChat(body.message, history);
    let fullContent = "";
    let isAborted = false;

    // 监听客户端连接断开
    req.on("close", () => {
      isAborted = true;
    });

    try {
      for await (const chunk of stream) {
        if (isAborted) break;

        const content = chunk?.content ?? "";
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      if (sessionId && fullContent && !isAborted) {
        await this.sessionService.addMessage(
          sessionId,
          "assistant",
          fullContent
        );
      }
    } catch (error) {
      if (!isAborted) {
        console.error("Chat streaming error:", error);
        res.write(
          `data: ${JSON.stringify({ error: "流生成过程发生错误" })}\n\n`
        );
      }
    } finally {
      if (!res.writableEnded) {
        res.write("data: [DONE]\n\n");
        res.end();
      }
    }
  }
}
