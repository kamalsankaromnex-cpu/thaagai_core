import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable credentials and CORS for Next.js frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });

  app.use(cookieParser());

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`[NestJS] Thaagai API running on http://localhost:${port}`);
}

bootstrap();
