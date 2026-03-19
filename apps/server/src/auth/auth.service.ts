import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService
  ) {}

  async register(email: string, password: string, name?: string) {
    const supabase = this.supabaseService.getAuthClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || "" },
      },
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    const user = data.user;
    if (!user) {
      throw new UnauthorizedException("注册失败，请稍后重试");
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || "",
      },
      access_token: token,
    };
  }

  async login(email: string, password: string) {
    const supabase = this.supabaseService.getAuthClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException("邮箱或密码错误");
    }

    const user = data.user;
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || "",
      },
      access_token: token,
    };
  }

  async getProfile(userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.admin.getUserById(userId);

    if (error || !data.user) {
      throw new UnauthorizedException("用户不存在");
    }

    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || "",
      created_at: data.user.created_at,
    };
  }
}
