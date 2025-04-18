import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from '@logging/winston/winston.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.useLogger(app.get(LoggerService));
  await app.listen(process.env.API_PORT ?? 3000);
}

bootstrap().catch((_error) => {});
