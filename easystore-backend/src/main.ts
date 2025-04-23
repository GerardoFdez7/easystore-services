import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';

import helmet, { HelmetOptions } from 'helmet';
import compression from 'compression';

import { KafkaConfigService } from '@infrastructure/transport/kafka/config/kafka-config.service';
import { LoggerService } from '@logging/winston/winston.service';

import { AppModule } from './app.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import waitPort from 'wait-port';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const loggerService = app.get(LoggerService);
  const kafkaConfigService = app.get(KafkaConfigService);

  app.useLogger(loggerService);
  app.connectMicroservice<MicroserviceOptions>(
    kafkaConfigService.createKafkaOptions(),
  );

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

  try {
    await waitPort({
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
      timeout: 30000,
    });
    loggerService.log('Redis up and running');
  } catch (error) {
    loggerService.warn(
      'Redis did not respond in 30s, NestJS app running without cache.',
      error,
    );
  }

  const [kHost, kPort] = process.env.KAFKA_BROKERS.split(':');
  try {
    await waitPort({ host: kHost, port: +kPort, timeout: 30000 });
    loggerService.log('Kafka up and running');
  } catch {
    loggerService.warn(
      'Kafka did not respond in 30s, NestJS app continuing without Kafka.',
    );
  }

  await app.startAllMicroservices().catch((error) => {
    loggerService.warn('Kafka mircroservices are down:', error);
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  loggerService.log(`Application running on port ${port}`);
}

bootstrap().catch((_error) => {
  const loggerService = new LoggerService();
  loggerService.error('Error bootstrapping application', _error);
  process.exit(1);
});
