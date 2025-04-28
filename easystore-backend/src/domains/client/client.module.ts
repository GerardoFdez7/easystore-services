import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgreModule } from '@database/postgre/postgre.module';
import { LoggerModule } from '@shared/winston/winston.module';
import { ClientResolver } from './presentation/graphql/client.resolver';
import { ClientPostgreRepository } from './infrastructure/persistence/postgre/client.postgre';
import { FindClientByBusinessNameHandler } from './aplication/queries/get-businessname/businessname.handler';
import { FindClientByEmailHandler } from './aplication/queries/get-email/email.handler';
import { LoginClientHandler } from './aplication/queries/login/login.handler';
import { RegisterClientHandler } from './aplication/commands/create/register.handler';
import { ClientCreatedHandler } from './aplication/events/client-created.handler';

// Command handlers
const CommandHandlers = [RegisterClientHandler];

// Query handlers
const QueryHandlers = [
  FindClientByEmailHandler,
  FindClientByBusinessNameHandler,
  LoginClientHandler,
];

// Event handlers
const EventHandlers = [ClientCreatedHandler];

@Module({
  imports: [CqrsModule, PostgreModule, LoggerModule],
  providers: [
    ClientResolver,
    ClientPostgreRepository,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class ClientModule {}
