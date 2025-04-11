import { Module } from '@nestjs/common';
import { ClientResolver } from './client.resolver';

@Module({
  imports: [],
  providers: [ClientResolver],
})
export class ClientModule {}
