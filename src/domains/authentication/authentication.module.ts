import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EmailModule } from '@email/index';

// Command Handlers
import {
  AuthenticationRegisterHandler,
  AuthenticationLoginHandler,
  AuthenticationLogoutHandler,
  AuthenticationValidateTokenHandler,
  ForgotPasswordHandler,
  UpdatePasswordHandler,
} from './application/commands';
// Event Handlers
import {
  IdentityRegisteredHandler,
  IdentityLoggedInHandler,
  IdentityLoggedOutHandler,
} from './application/events';
import {
  AuthenticationRepository,
  CustomerRepository,
  EmployeeRepository,
} from './infrastructure/persistence/postgres';
import TenantRepository from '../tenant/infrastructure/persistence/postgres/tenant.repository';
import AuthGuard from './infrastructure/guard/auth.guard';
import {
  AuthEmailService,
  ForgotPasswordEmailBuilder,
} from './infrastructure/emails';
import AuthenticationResolver from './presentation/graphql/authentication.resolver';

const CommandHandlers = [
  AuthenticationRegisterHandler,
  AuthenticationLoginHandler,
  AuthenticationLogoutHandler,
  AuthenticationValidateTokenHandler,
  ForgotPasswordHandler,
  UpdatePasswordHandler,
];
const EventHandlers = [
  IdentityRegisteredHandler,
  IdentityLoggedInHandler,
  IdentityLoggedOutHandler,
];

const EmailBuilders = [ForgotPasswordEmailBuilder];

@Module({
  imports: [CqrsModule, EmailModule],
  providers: [
    {
      provide: 'AuthRepository',
      useClass: AuthenticationRepository,
    },
    {
      provide: 'TenantRepository',
      useClass: TenantRepository,
    },
    {
      provide: 'CustomerRepository',
      useClass: CustomerRepository,
    },
    {
      provide: 'EmployeeRepository',
      useClass: EmployeeRepository,
    },
    {
      provide: 'AuthEmailService',
      useClass: AuthEmailService,
    },
    AuthenticationResolver,
    AuthGuard,
    ...CommandHandlers,
    ...EventHandlers,
    ...EmailBuilders,
  ],
  exports: [AuthGuard],
})
export class AuthenticationDomain {}
