import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsIn,
} from "class-validator";
import { Type } from "class-transformer";

export class HistoryMessageDto {
  @IsString()
  @IsIn(["user", "assistant", "system"])
  role!: "user" | "assistant" | "system";

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
