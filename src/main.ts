import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { Logger as NestLogger } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import './config/logger/global-logger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: false, // Disable NestJS default logger during startup
  });
  app.useLogger(app.get(Logger));

  // Cookie parser middleware
  app.use(cookieParser());

  // CORS Config
  app.enableCors({
    origin: [process.env.FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(process.env.PORT);

  const logger = app.get(Logger);

  // Test database connection
  try {
    const prisma = app.get(PostgreService);
    await prisma.$queryRaw`SELECT 1`;
    logger.log(`Postgres connection successful`);
  } catch (error) {
    logger.fatal(`Postgres connection failed:`, error);
  }
}

bootstrap().catch((error) => {
  const logger = new NestLogger('Bootstrap');
  logger.fatal('NestJS failed to start:', error);
  process.exit(1);
});
