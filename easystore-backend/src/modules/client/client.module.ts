import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientResolver } from './client.resolver';
import { ClientService } from './client.service';
import {
  LoginClientHandler,
  RegisterClientHandler,
} from './commands/client.command.handler';
import { FindClientByEmailHandler } from './queries/client.query.handler';
import { Postgre } from '@/infrastructure/database/postgre/postgre';
import { LoginClientCommand } from './commands/client.command';

@Module({
  imports: [CqrsModule],
  providers: [
    ClientResolver,
    ClientService,
    Postgre,
    RegisterClientHandler,
    FindClientByEmailHandler,
    LoginClientHandler,
  ],
  //exports:[ClientResolver]
})
export class ClientModule {}
