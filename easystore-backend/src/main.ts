import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@logging/winston/winston.service';
import helmet, { HelmetOptions } from 'helmet';
import * as compression from 'compression';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: false,
  });

  const configService = app.get(ConfigService);
  const loggerService = app.get(LoggerService);

  app.useLogger(loggerService);
  app.use(helmet() as unknown as HelmetOptions);
  app.use(compression());

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGINS', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);

  loggerService.log(`Application running on port ${port}`);
}

bootstrap().catch((_error) => {
  const loggerService = new LoggerService();
  loggerService.error('Error bootstrapping application', _error);
  process.exit(1);
});
