import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailModule } from '@email/index';

// Command Handlers
import {
  AuthenticationRegisterHandler,
  AuthenticationLoginHandler,
  AuthenticationLogoutHandler,
  ForgotPasswordHandler,
  UpdatePasswordHandler,
  GetInTouchHandler,
} from './application/commands';
// Query Handlers
import { AuthenticationValidateTokenHandler } from './application/queries';
// Event Handlers
import {
  IdentityRegisteredHandler,
  IdentityLoggedInHandler,
  IdentityLoggedOutHandler,
  IdentityPasswordUpdatedHandler,
  IdentityEmailUpdatedHandler,
} from './application/events';
import {
  AuthenticationRepository,
  EmployeeRepository,
} from './infrastructure/persistence/postgres';
import { CustomerRepository } from '../customer/infrastructure/database/postgres/customer.repository';
import TenantRepository from '../tenant/infrastructure/persistence/postgres/tenant.repository';
import AuthGuard from './infrastructure/guard/auth.guard';
import {
  AuthEmailService,
  ForgotPasswordEmailBuilder,
  GetInTouchEmailBuilder,
} from './infrastructure/emails';
import { PasswordResetRateLimiter } from './infrastructure/rate-limiting/password-reset-rate-limiter';
import { CleanupService } from './infrastructure/cron';
import AuthenticationResolver from './presentation/graphql/authentication.resolver';

const CommandHandlers = [
  AuthenticationRegisterHandler,
  AuthenticationLoginHandler,
  AuthenticationLogoutHandler,
  ForgotPasswordHandler,
  UpdatePasswordHandler,
  GetInTouchHandler,
];

const QueryHandlers = [AuthenticationValidateTokenHandler];

const EventHandlers = [
  IdentityRegisteredHandler,
  IdentityLoggedInHandler,
  IdentityLoggedOutHandler,
  IdentityPasswordUpdatedHandler,
  IdentityEmailUpdatedHandler,
];

const EmailBuilders = [ForgotPasswordEmailBuilder, GetInTouchEmailBuilder];

const RateLimiters = [PasswordResetRateLimiter];

const CronServices = [CleanupService];

@Module({
  imports: [CqrsModule, ScheduleModule.forRoot(), EmailModule],
  providers: [
    {
      provide: 'AuthRepository',
      useClass: AuthenticationRepository,
    },
    {
      provide: 'ITenantRepository',
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
    ...QueryHandlers,
    ...EventHandlers,
    ...EmailBuilders,
    ...RateLimiters,
    ...CronServices,
  ],
  exports: [AuthGuard],
})
export class AuthenticationDomain {}
