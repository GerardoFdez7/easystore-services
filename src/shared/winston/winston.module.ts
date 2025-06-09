import { Module } from '@nestjs/common';
import { LoggerService } from './winston.service';

@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
