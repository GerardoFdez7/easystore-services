import { Module, Global } from '@nestjs/common';
import { PostgreService } from './postgre.service';

@Global()
@Module({
  providers: [PostgreService],
  exports: [PostgreService],
})
export class PostgreModule {}
