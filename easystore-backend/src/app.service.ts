import { Injectable } from '@nestjs/common';
import { LoggerService } from '@logging/winston/winston.service';

@Injectable()
export class AppService {
  constructor(private readonly logger: LoggerService) {}

  getHello(): string {
    this.logger.log('getHello was called', {
      timestamp: new Date().toISOString(),
    });
    return 'Hello World!';
  }
}
