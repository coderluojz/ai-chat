import { IsOptional, IsString } from "class-validator";

export class CreateSessionDto {
  @IsOptional()
  @IsString()
  title?: string;
}

export class UpdateSessionDto {
  @IsString()
  title!: string;
}
