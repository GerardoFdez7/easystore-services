import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgresModule } from '@database/postgres.module';
import { LoggerModule } from '@winston/winston.module';
import { Provider } from '@nestjs/common';

// Handlers
// import { AuthLoginHandler } from './application/commands/login/login.handler';
import { AuthenticationRegisterHandler } from './application/commands/create/sign-up.handler';

// Repository
import { AuthenticationRepository } from '../authentication/infrastructure/persistence/postgres/authentication.repository';

// GraphQL Resolver o Controller (si tienes uno, puedes agregarlo aquí)
import { AuthenticationResolver } from './presentation/graphql/authentication.resolver';

import { AuthenticationRegisterEvent } from './aggregates/events/authentication-register.event';

// Agrupación de handlers
const CommandHandlers = [AuthenticationRegisterHandler];
const QueryHandlers: Provider[] = [];
const EventHandlers = [AuthenticationRegisterEvent];

@Module({
  imports: [CqrsModule, PostgresModule, LoggerModule],
  providers: [
    AuthenticationRepository,
    {
      provide: 'AuthRepository',
      useClass: AuthenticationRepository,
    },
    AuthenticationResolver,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [],
})
export class AuthenticationModule {}
