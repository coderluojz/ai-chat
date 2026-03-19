import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // enable class-validator globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip decorator-less properties
      forbidNonWhitelisted: true, // throw error if non-whitelisted properties are present
      transform: true, // automatically transform payloads to DTO instances
    }),
  );

  app.enableCors({
    origin: "http://localhost:3000",
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap().catch(() => {});
