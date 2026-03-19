import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";
import { MessageRole } from "../../common/enums/message-role.enum";

export class HistoryMessageDto {
  @IsEnum(MessageRole, { message: "无效的消息角色" })
  role!: MessageRole;

  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class ChatCompletionsDto {
  @IsString()
  @IsNotEmpty({ message: "消息内容不能为空" })
  message!: string;

  @IsOptional()
  @IsString()
  session_id?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoryMessageDto)
  history?: HistoryMessageDto[];
}
