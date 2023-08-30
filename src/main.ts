import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { handleGlobalErrors } from './errors/global-error-handler';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './config/setup-swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS
  const corsConfig = configService.get('CORS');
  app.enableCors(corsConfig);

  // Global Error Handling
  handleGlobalErrors();

  // Swagger
  setupSwagger(app);

  // Listen
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
}

bootstrap();
