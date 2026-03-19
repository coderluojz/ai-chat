import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { ChatModule } from "./chat/chat.module";
import { envSchema } from "./common/config/env-validation.config";
import { SessionModule } from "./session/session.module";
import { SupabaseModule } from "./supabase/supabase.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config: Record<string, unknown>) => {
        const result = envSchema.safeParse(config);
        if (!result.success) {
          const errors = result.error.errors
            .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
            .join("\n");
          throw new Error(`环境变量验证失败:\n${errors}`);
        }
        return result.data;
      },
    }),
    SupabaseModule,
    AuthModule,
    SessionModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
