import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @IsEmail({}, { message: "请输入有效的邮箱地址" })
  @IsNotEmpty({ message: "邮箱不能为空" })
  email!: string;

  @IsString()
  @MinLength(6, { message: "密码长度不能少于 6 位" })
  @IsNotEmpty({ message: "密码不能为空" })
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class LoginDto {
  @IsEmail({}, { message: "请输入有效的邮箱地址" })
  @IsNotEmpty({ message: "邮箱不能为空" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "密码不能为空" })
  password!: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: "请输入有效的邮箱地址" })
  @IsNotEmpty({ message: "邮箱不能为空" })
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: "重置令牌不能为空" })
  token!: string;

  @IsString()
  @MinLength(6, { message: "密码长度不能少于 6 位" })
  @IsNotEmpty({ message: "新密码不能为空" })
  newPassword!: string;
}
