import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import {
  CurrentUser,
  JwtPayload,
} from "../common/decorators/current-user.decorator";
import { MessageRole } from "../common/enums/message-role.enum";
import { Message } from "../common/interfaces/database.interface";
import { SSEEventType } from "../common/interfaces/sse-event.interface";
import { BlockType } from "../common/interfaces/ui-block.interface";
import { SessionService } from "../session/session.service";
import { ChatService } from "./chat.service";
import { ChatCompletionsDto } from "./dto/chat.dto";

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

    // 验证会话所有权并保存用户消息
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

    // 构建对话历史
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

    // 设置 SSE 头部
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let fullContent = "";
    let isAborted = false;

    req.on("close", () => {
      isAborted = true;
    });

    try {
      const stream = await this.chatService.streamChat(body.message, history);
      const textBlockId = randomUUID();
      const toolCalls: Array<{
        id: string;
        name: string;
        args: Record<string, unknown>;
      }> = [];

      for await (const chunk of stream) {
        if (isAborted) break;

        const chunkContent = (chunk as { content?: unknown })?.content;
        let textContent = "";

        if (typeof chunkContent === "string") {
          textContent = chunkContent;
        } else if (Array.isArray(chunkContent)) {
          textContent = chunkContent
            .filter((c): c is { type: "text"; text: string } => c.type === "text")
            .map((c) => c.text)
            .join("");
        }

        if (textContent) {
          fullContent += textContent;
          res.write(
            `data: ${JSON.stringify({
              type: SSEEventType.TEXT_DELTA,
              blockId: textBlockId,
              content: textContent,
            })}\n\n`,
          );
        }

        const chunkToolCalls =
          (
            chunk as {
              tool_calls?: Array<{
                id?: string;
                name?: string;
                args?: Record<string, unknown>;
              }>;
            }
          )?.tool_calls || [];

        for (const tc of chunkToolCalls) {
          const existing = toolCalls.find((t) => t.id === tc.id);
          if (existing) {
            if (tc.args) {
              existing.args = { ...existing.args, ...tc.args };
            }
          } else if (tc.id && tc.name) {
            toolCalls.push({
              id: tc.id,
              name: tc.name,
              args: tc.args || {},
            });
          }
        }
      }

      if (!isAborted && toolCalls.length > 0) {
        const blocks = await this.chatService.executeToolCalls(toolCalls);
        for (const block of blocks) {
          if (block.type === BlockType.TEXT) {
            fullContent += (block.content as { text: string }).text;
          }
          res.write(
            `data: ${JSON.stringify({
              type: SSEEventType.BLOCK_COMPLETE,
              block,
            })}\n\n`,
          );
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
      if (!isAborted && !res.writableEnded) {
        console.error("Chat streaming error:", error);
        res.write(
          `data: ${JSON.stringify({ type: SSEEventType.ERROR, message: "流生成过程发生错误" })}\n\n`,
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
