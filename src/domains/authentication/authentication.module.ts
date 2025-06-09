import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgresModule } from '@database/postgres.module';
import { LoggerModule } from '@winston/winston.module';
import { Provider } from '@nestjs/common';
import { AuthenticationRegisterHandler } from './application/commands/create/sign-up.handler';
import { AuthenticationRepository } from './infrastructure/persistence/postgres/authentication.repository';
import { AuthenticationResolver } from './presentation/graphql/authentication.resolver';
import { AuthenticationRegisterEvent } from './aggregates/events/authentication-register.event';
import { AuthenticationLoginHandler } from './application/queries/select/sign-in.handler';

// Agrupación de handlers
const CommandHandlers = [
  AuthenticationRegisterHandler,
  AuthenticationLoginHandler,
];
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
export class AuthenticationDomain {}
