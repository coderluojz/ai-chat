import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS 配置 - 从环境变量读取
  const corsOrigin = configService.get<string>(
    "CORS_ORIGIN",
    "http://localhost:3000",
  );
  app.enableCors({
    // origin: corsOrigin.split(",").map((origin) => origin.trim()),
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  });

  const port = configService.get<number>("PORT", 3001);
  await app.listen(port);
  console.log(`🚀 服务已启动: http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error("应用启动失败:", error);
  process.exit(1);
});
