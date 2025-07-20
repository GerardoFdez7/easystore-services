import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgresModule } from '@database/postgres.module';
import { LoggerModule } from '@winston/winston.module';
import {
  AuthenticationRegisterHandler,
  AuthenticationLoginHandler,
  AuthenticationLogoutHandler,
} from './application/commands';
import {
  IdentityRegisteredHandler,
  IdentityLoggedInHandler,
  IdentityLoggedOutHandler,
} from './application/events';
import { AuthenticationRepository } from './infrastructure/persistence/postgres/authentication.repository';
import { TenantRepository } from '../tenant/infrastructure/persistence/postgres/tenant.repository';
import { AuthenticationResolver } from './presentation/graphql/authentication.resolver';

const CommandHandlers = [
  AuthenticationRegisterHandler,
  AuthenticationLoginHandler,
  AuthenticationLogoutHandler,
];
const EventHandlers = [
  IdentityRegisteredHandler,
  IdentityLoggedInHandler,
  IdentityLoggedOutHandler,
];

@Module({
  imports: [CqrsModule, PostgresModule, LoggerModule],
  providers: [
    {
      provide: 'AuthRepository',
      useClass: AuthenticationRepository,
    },
    {
      provide: 'TenantRepository',
      useClass: TenantRepository,
    },
    AuthenticationResolver,
    ...CommandHandlers,
    ...EventHandlers,
  ],
})
export class AuthenticationDomain {}
