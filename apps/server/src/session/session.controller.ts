import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSessionDto, UpdateSessionDto } from './dto/session.dto';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  async findAll(@Request() req: any) {
    return this.sessionService.findAll(req.user.sub);
  }

  @Post()
  async create(@Request() req: any, @Body() body: CreateSessionDto) {
    return this.sessionService.create(req.user.sub, body.title);
  }

  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: UpdateSessionDto,
  ) {
    return this.sessionService.update(req.user.sub, id, body.title);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.sessionService.remove(req.user.sub, id);
  }

  @Get(':id/messages')
  async getMessages(@Request() req: any, @Param('id') id: string) {
    return this.sessionService.getMessages(req.user.sub, id);
  }
}
