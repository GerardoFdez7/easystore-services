import { NestFactory } from '@nestjs/core';
import { LoggerService } from '@logger/winston.service';
import { PostgreService } from '@database/postgres.service';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.useLogger(app.get(LoggerService));

  // Cookie parser middleware
  app.use(cookieParser());

  // CORS Config
  app.enableCors({
    origin: [process.env.FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(process.env.PORT);

  const logger = app.get(LoggerService);

  // Test database connection
  try {
    const prisma = app.get(PostgreService);
    await prisma.$queryRaw`SELECT 1`;
    logger.log(`Postgres connection successful`);
  } catch (error) {
    logger.error(`❌ Postgres connection failed:`, error);
  }
}

bootstrap().catch((error) => {
  const logger = new LoggerService();
  logger.error('NestJS failed to start:', error);
  process.exit(1);
});
