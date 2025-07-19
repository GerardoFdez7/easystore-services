import { NestFactory } from '@nestjs/core';
import { LoggerService } from '@winston/winston.service';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.useLogger(app.get(LoggerService));

  // CORS Config
  app.enableCors({
    origin: ['http://localhost:3000', 'https://easystoredev.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  const logger = new LoggerService();
  logger.error('NestJS failed to start:', error);
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
