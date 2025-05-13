import { NestFactory } from '@nestjs/core';
// import { ConfigService } from '@nestjs/config';
// import { ValidationPipe, VersioningType } from '@nestjs/common';
// import helmet, { HelmetOptions } from 'helmet';
// import * as compression from 'compression';
// //import { KafkaConfigService } from '@shared/kafka/config/kafka-config.service';
import { LoggerService } from '@shared/winston/winston.service';
import { AppModule } from './app.module';
// //import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.useLogger(app.get(LoggerService));
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  const logger = new LoggerService();
  logger.error('NestJS failed to start:', error);
  process.exit(1);
});

// async function bootstrap(): Promise<void> {
//   const app = await NestFactory.create(AppModule, {
//     bufferLogs: true,
//     logger: false,
//   });

//   const configService = app.get(ConfigService);
//   const loggerService = app.get(LoggerService);
//   //const kafkaConfigService = app.get(KafkaConfigService);

//   app.useLogger(loggerService);
//   // app.connectMicroservice<MicroserviceOptions>(
//   //   kafkaConfigService.createKafkaOptions(),
//   // );

//   app.use(helmet() as unknown as HelmetOptions);
//   app.use(compression());

//   app.enableCors({
//     origin: configService.get<string>('CORS_ORIGINS', '*'),
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true,
//   });

//   app.enableVersioning({
//     type: VersioningType.URI,
//     defaultVersion: '1',
//   });

//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       transform: true,
//       forbidNonWhitelisted: true,
//       transformOptions: {
//         enableImplicitConversion: true,
//       },
//     }),
//   );

//   await app.startAllMicroservices();
//   const port = configService.get<number>('PORT', 3000);

//   await app.listen(port);

//   loggerService.log(`Application running on port ${port}`);
// }

// // bootstrap().catch((_error) => {
// //   const loggerService = new LoggerService();
// //   loggerService.error('Error bootstrapping application', _error);
// //   process.exit(1);
// // });
