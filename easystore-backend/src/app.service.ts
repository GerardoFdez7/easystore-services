import { Injectable } from '@nestjs/common';
import logger from './common/logger/winston.logger';

@Injectable()
export class AppService {
  getHello(): string {
    logger.info({
      message: 'Se llamó a getHello',
      timestamp: new Date().toISOString(),
    });
    return 'Hello World!';
  }
}
