import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import {
  CustomLoggerService,
  initializeGlobalLogger,
  getPinoLogger,
} from '@config/logger';

async function bootstrap(): Promise<void> {
  // Initialize global logger first
  initializeGlobalLogger();
  const logger = getPinoLogger();

  const app = await NestFactory.create(AppModule, {
    logger: new CustomLoggerService(),
  });

  // Cookie parser middleware
  app.use(cookieParser());

  // CORS Config
  app.enableCors({
    origin: [process.env.FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    credentials: true,
  });

  const port = process.env.PORT;
  await app.listen(port);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`GraphQL endpoint available at: http://localhost:${port}/gql`);
}

bootstrap().catch((error) => {
  logger.fatal(`NestJS failed to start. ${error}`);
  process.exit(1);
});
