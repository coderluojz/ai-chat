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
}
