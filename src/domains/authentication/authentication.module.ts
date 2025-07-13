import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgresModule } from '@database/postgres.module';
import { LoggerModule } from '@winston/winston.module';
import {
  AuthenticationRegisterHandler,
  AuthenticationLoginHandler,
} from './application/commands';
import {
  IdentityRegisteredHandler,
  IdentityLoggedInHandler,
} from './application/events';
import { AuthenticationRepository } from './infrastructure/persistence/postgres/authentication.repository';
import { AuthenticationResolver } from './presentation/graphql/authentication.resolver';

const CommandHandlers = [
  AuthenticationRegisterHandler,
  AuthenticationLoginHandler,
];
const EventHandlers = [IdentityRegisteredHandler, IdentityLoggedInHandler];

@Module({
  imports: [CqrsModule, PostgresModule, LoggerModule],
  providers: [
    {
      provide: 'AuthRepository',
      useClass: AuthenticationRepository,
    },
    AuthenticationResolver,
    ...CommandHandlers,
    ...EventHandlers,
  ],
})
export class AuthenticationDomain {}
