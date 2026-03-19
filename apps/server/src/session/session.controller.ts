import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { SessionService } from "./session.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateSessionDto, UpdateSessionDto } from "./dto/session.dto";
import {
  CurrentUser,
  JwtPayload,
} from "../common/decorators/current-user.decorator";

@Controller("sessions")
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.sessionService.findAll(user.sub);
  }

  @Post()
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateSessionDto,
  ) {
    return this.sessionService.create(user.sub, body.title);
  }

  @Patch(":id")
  async update(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() body: UpdateSessionDto,
  ) {
    return this.sessionService.update(user.sub, id, body.title);
  }

  @Delete(":id")
  async remove(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.sessionService.remove(user.sub, id);
  }

  @Get(":id/messages")
  async getMessages(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.sessionService.getMessages(user.sub, id);
  }
}
