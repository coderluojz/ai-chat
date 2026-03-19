/**
 * 统一DTO定义
 * 包含分页、响应和错误处理
 */

import { IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export enum ORDER_BY {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  CREATED_AT_DESC = "createdAt DESC",
  UPDATED_AT_DESC = "updatedAt DESC",
}

export class BasePaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string;
}

export class BaseResponseDto<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}
