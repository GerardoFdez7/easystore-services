import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientResolver } from './client.resolver';
import { ClientService } from './client.service';
import { RegisterClientHandler } from './commands/client.command.handler';
import { FindClientByEmailHandler } from './queries/client.query.handler';
import { Postgre } from '@/infrastructure/database/postgre/postgre';

@Module({
  imports: [CqrsModule],
  providers: [
    ClientResolver,
    ClientService,
    Postgre,
    RegisterClientHandler,
    FindClientByEmailHandler,
  ],
  //exports:[ClientResolver]
})
export class ClientModule {}
