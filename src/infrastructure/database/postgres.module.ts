import { Module, Global } from '@nestjs/common';
import { PostgreService } from './postgres.service';

@Global()
@Module({
  providers: [PostgreService],
  exports: [PostgreService],
})
export class PostgresModule {}
