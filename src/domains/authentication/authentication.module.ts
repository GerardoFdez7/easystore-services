import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgresModule } from '@database/postgres.module';
import { LoggerModule } from '@winston/winston.module';
import { EmailModule } from '../../shared/email/email.module';
import {
  AuthenticationRegisterHandler,
  AuthenticationLoginHandler,
  AuthenticationLogoutHandler,
  AuthenticationValidateTokenHandler,
  ForgotPasswordHandler,
} from './application/commands';
import {
  IdentityRegisteredHandler,
  IdentityLoggedInHandler,
  IdentityLoggedOutHandler,
} from './application/events';
import { AuthenticationRepository } from './infrastructure/persistence/postgres/authentication.repository';
import { CustomerRepository } from './infrastructure/persistence/postgres/customer.repository';
import { EmployeeRepository } from './infrastructure/persistence/postgres/employee.repository';
import { AuthGuard } from './infrastructure/guard/auth.guard';
import { TenantRepository } from '../tenant/infrastructure/persistence/postgres/tenant.repository';
import { AuthenticationResolver } from './presentation/graphql/authentication.resolver';

const CommandHandlers = [
  AuthenticationRegisterHandler,
  AuthenticationLoginHandler,
  AuthenticationLogoutHandler,
  AuthenticationValidateTokenHandler,
  ForgotPasswordHandler,
];
const EventHandlers = [
  IdentityRegisteredHandler,
  IdentityLoggedInHandler,
  IdentityLoggedOutHandler,
];

@Module({
  imports: [CqrsModule, PostgresModule, LoggerModule, EmailModule],
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
    AuthenticationResolver,
    AuthGuard,
    ...CommandHandlers,
    ...EventHandlers,
  ],
  exports: [AuthGuard],
})
export class AuthenticationDomain {}
