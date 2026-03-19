import { Controller, Post, Body, UseGuards, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { ChatService } from "./chat.service";
import { SessionService } from "../session/session.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ChatCompletionsDto } from "./dto/chat.dto";
import {
  CurrentUser,
  JwtPayload,
} from "../common/decorators/current-user.decorator";
import { Message } from "../common/interfaces/database.interface";
import { MessageRole } from "../common/enums/message-role.enum";

@Controller("chat")
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly sessionService: SessionService,
  ) {}

  @Post("completions")
  @UseGuards(JwtAuthGuard)
  async completions(
    @CurrentUser() user: JwtPayload,
    @Body() body: ChatCompletionsDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = user.sub;
    const sessionId = body.session_id;

    if (sessionId) {
      const isOwner = await this.sessionService.verifySessionOwnership(
        userId,
        sessionId,
      );
      if (!isOwner) {
        res.status(403).json({
          code: 403,
          message: "无权访问此会话",
          data: null,
        });
        return;
      }

      await this.sessionService.addMessage(
        userId,
        sessionId,
        MessageRole.USER,
        body.message,
      );
    }

    let history: [string, string][] = body.history
      ? body.history.map((h) => [h.role, h.content] as [string, string])
      : [];
    if (sessionId && history.length === 0) {
      const messages = await this.sessionService.getMessages(userId, sessionId);
      const pastMessages = messages.slice(0, -1);
      history = pastMessages.map(
        (m: Message) => [m.role, m.content] as [string, string],
      );
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const stream = await this.chatService.streamChat(body.message, history);
    let fullContent = "";
    let isAborted = false;

    req.on("close", () => {
      isAborted = true;
    });

    try {
      for await (const chunk of stream) {
        if (isAborted) break;

        const chunkContent = chunk?.content;
        let textContent = "";

        if (typeof chunkContent === "string") {
          textContent = chunkContent;
        } else if (Array.isArray(chunkContent)) {
          textContent = chunkContent
            .filter(
              (c): c is { type: "text"; text: string } => c.type === "text",
            )
            .map((c) => c.text)
            .join("");
        }

        if (textContent) {
          fullContent += textContent;
          res.write(`data: ${JSON.stringify({ content: textContent })}\n\n`);
        }
      }

      if (sessionId && fullContent && !isAborted) {
        await this.sessionService.addMessage(
          userId,
          sessionId,
          MessageRole.ASSISTANT,
          fullContent,
        );
      }
    } catch (error) {
      if (!isAborted) {
        console.error("Chat streaming error:", error);
        res.write(
          `data: ${JSON.stringify({ error: "流生成过程发生错误" })}\n\n`,
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
