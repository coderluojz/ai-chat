import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { SupabaseService } from "../supabase/supabase.service";
import { User } from "../common/interfaces/database.interface";

interface TokenPayload {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
  };
  created_at: string;
}

interface SupabaseUserMetadata {
  name?: string;
}

function getUserMetadataName(
  metadata: SupabaseUserMetadata | undefined,
): string {
  return metadata?.name || "";
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(
    email: string,
    password: string,
    name?: string,
  ): Promise<{ user: User; access_token: string }> {
    const supabase = this.supabaseService.getClient();

    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || "" },
      },
    });

    if (result.error) {
      this.logger.warn(`注册失败: ${result.error.message}`);
      throw new UnauthorizedException(result.error.message);
    }

    const supabaseUser = result.data.user;
    if (!supabaseUser) {
      throw new UnauthorizedException("注册失败，请稍后重试");
    }

    const token = this.generateToken(supabaseUser as unknown as TokenPayload);
    const userMetadata = supabaseUser.user_metadata as
      | SupabaseUserMetadata
      | undefined;

    return {
      user: {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        name: getUserMetadataName(userMetadata),
        created_at: supabaseUser.created_at,
      },
      access_token: token,
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: User; access_token: string }> {
    const supabase = this.supabaseService.getClient();

    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (result.error) {
      this.logger.warn(`登录失败: ${result.error.message}`);
      throw new UnauthorizedException("邮箱或密码错误");
    }

    const supabaseUser = result.data.user;
    const token = this.generateToken(supabaseUser as unknown as TokenPayload);
    const userMetadata = supabaseUser.user_metadata as
      | SupabaseUserMetadata
      | undefined;

    return {
      user: {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        name: getUserMetadataName(userMetadata),
        created_at: supabaseUser.created_at,
      },
      access_token: token,
    };
  }

  async getProfile(userId: string): Promise<User> {
    const supabase = this.supabaseService.getClient();

    const result = await supabase.auth.admin.getUserById(userId);

    if (result.error || !result.data.user) {
      throw new UnauthorizedException("用户不存在");
    }

    const supabaseUser = result.data.user;
    const userMetadata = supabaseUser.user_metadata as
      | SupabaseUserMetadata
      | undefined;

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      name: getUserMetadataName(userMetadata),
      created_at: supabaseUser.created_at,
    };
  }

  private generateToken(user: TokenPayload): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email || "",
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${this.configService.get<string>("FRONTEND_URL", "http://localhost:3000")}/reset-password`,
    });

    if (error) {
      this.logger.warn(`发送重置密码邮件失败: ${error.message}`);
      // 为了安全，即使邮箱不存在也返回成功
    }

    return {
      message: "如果该邮箱已注册，重置密码的邮件已发送",
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const supabase = this.supabaseService.getClient();

    // 使用 token 交换 session
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "recovery",
    });

    if (verifyError) {
      this.logger.warn(`验证重置令牌失败: ${verifyError.message}`);
      throw new UnauthorizedException("重置链接无效或已过期");
    }

    // 更新密码
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      this.logger.warn(`更新密码失败: ${updateError.message}`);
      throw new UnauthorizedException("密码更新失败，请重试");
    }

    return {
      message: "密码重置成功，请使用新密码登录",
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const supabase = this.supabaseService.getClient();

    // 获取用户邮箱
    const { data: userData, error: getUserError } =
      await supabase.auth.admin.getUserById(userId);

    if (getUserError || !userData.user?.email) {
      throw new UnauthorizedException("用户不存在");
    }

    // 验证当前密码（通过尝试登录）
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password: currentPassword,
    });

    if (verifyError) {
      throw new UnauthorizedException("当前密码错误");
    }

    // 更新密码
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword },
    );

    if (updateError) {
      this.logger.warn(`更新密码失败: ${updateError.message}`);
      throw new UnauthorizedException("密码更新失败，请重试");
    }

    return {
      message: "密码修改成功",
    };
  }
}
