import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericSupabaseClient = SupabaseClient<any, any, any, any>;

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: GenericSupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>("SUPABASE_URL");
    const serviceKey = this.configService.get<string>(
      "SUPABASE_SERVICE_ROLE_KEY",
    );

    if (!url || !serviceKey) {
      throw new Error(
        "Supabase 配置缺失：请检查 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY",
      );
    }

    this.client = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.logger.log("Supabase 客户端初始化成功");
  }

  getClient(): GenericSupabaseClient {
    return this.client;
  }
}
