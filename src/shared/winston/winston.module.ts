import { Module, Global } from '@nestjs/common';
import { LoggerService } from './winston.service';

@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
