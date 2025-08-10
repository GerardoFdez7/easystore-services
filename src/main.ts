import { NestFactory } from '@nestjs/core';
import { LoggerService } from '@winston/winston.service';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.useLogger(app.get(LoggerService));

  // Cookie parser middleware
  app.use(cookieParser());

  // CORS Config
  app.enableCors({
    origin: [process.env.FRONTEND_URL, 'https://easystoredev.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  const logger = new LoggerService();
  logger.error('NestJS failed to start:', error);
  process.exit(1);
});
