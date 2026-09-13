import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import {
  CustomLoggerService,
  initializeGlobalLogger,
  getPinoLogger,
} from '@config/logger';
import { PostgreService } from '@database/postgres.service';
import { assertFeatureCatalogSeeded } from '@database/seeders/production.seed';

export async function bootstrap(): Promise<void> {
  // Initialize global logger first
  initializeGlobalLogger();
  const logger = getPinoLogger();
  let app: INestApplication | undefined;

  try {
    app = await NestFactory.create(AppModule, {
      logger: new CustomLoggerService(),
      abortOnError: false,
    });
    const configService = app.get(ConfigService);
    const isDevelopment =
      configService.get<string>('NODE_ENV') === 'development';
    const corsOrigins = [configService.getOrThrow<string>('FRONTEND_URL')];

    // Refuse to start if the seeded Feature catalog is missing a FeatureEnum
    await assertFeatureCatalogSeeded(app.get(PostgreService));

    if (isDevelopment) {
      corsOrigins.push('https://studio.apollographql.com');
    }

    // Cookie parser middleware
    app.use(cookieParser());

    // CORS Config
    app.enableCors({
      origin: corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      credentials: true,
    });

    const port = configService.getOrThrow<string>('PORT');
    await app.listen(port);
    logger.info(`Environment: ${configService.get<string>('NODE_ENV')}`);
    logger.info(`GraphQL endpoint available at: http://localhost:${port}/gql`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('NestJS failed to start:', error);
    logger.fatal('NestJS failed to start', error);

    try {
      await app?.close();
    } finally {
      process.exitCode = 1;
    }
  }
}

if (require.main === module) {
  void bootstrap();
}
