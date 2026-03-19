import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatCompletionsDto {
  @IsString()
  @IsNotEmpty({ message: '消息内容不能为空' })
  message!: string;

  @IsOptional()
  @IsString()
  session_id?: string;

  @IsOptional()
  @IsArray()
  history?: any[];
}
