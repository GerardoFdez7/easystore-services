import { Module, Global } from '@nestjs/common';
import { PostgreService } from './postgres.service';
import { TransactionManager } from '@shared/infrastructure/postgres';

@Global()
@Module({
  providers: [PostgreService, TransactionManager],
  exports: [PostgreService, TransactionManager],
})
export class PostgresModule {}
