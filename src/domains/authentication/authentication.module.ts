import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
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
  TenantProvisioningHandler,
} from './application/events';
import {
  AuthenticationRepository,
  CustomerRepository,
  EmployeeRepository,
} from './infrastructure/persistence/postgres';
import { TenantAdapter } from './infrastructure/adapters';
import AuthGuard from './infrastructure/guard/auth.guard';
import { JwtStrategy } from './infrastructure/strategies/jwt/jwt.strategy';
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
  TenantProvisioningHandler,
];

const EmailBuilders = [ForgotPasswordEmailBuilder, GetInTouchEmailBuilder];

const RateLimiters = [PasswordResetRateLimiter];

const CronServices = [CleanupService];

@Module({
  imports: [
    CqrsModule,
    ScheduleModule.forRoot(),
    EmailModule,
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  providers: [
    {
      provide: 'AuthRepository',
      useClass: AuthenticationRepository,
    },
    {
      provide: 'ITenantAdapter',
      useClass: TenantAdapter,
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
    JwtStrategy,
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
