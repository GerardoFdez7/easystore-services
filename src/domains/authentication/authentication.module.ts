import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
  SwitchStoreHandler,
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
} from './infrastructure/postgres';
import {
  CustomerAdapter,
  CustomerOnboardingAdapter,
  StoreAdapter,
  TenantOnboardingAdapter,
  TenantAdapter,
} from './infrastructure/adapters';
import AuthenticationGuard from './infrastructure/guard/authentication.guard';
import AuthorizationGuard from './infrastructure/guard/authorization.guard';
import { PermissionService } from './infrastructure/guard/authorization/permission.service';
import { JwtStrategy } from './infrastructure/strategies/jwt/jwt.strategy';
import {
  AuthEmailService,
  ForgotPasswordEmailBuilder,
  GetInTouchEmailBuilder,
} from './infrastructure/emails';
import { PasswordResetRateLimiter } from './infrastructure/rate-limiting/password-reset-rate-limiter';
import { CleanupService } from './infrastructure/cron';
import {
  CustomerOnboardingService,
  TenantOnboardingService,
} from './infrastructure/onboarding';
import AuthenticationResolver from './presentation/graphql/authentication.resolver';

const CommandHandlers = [
  AuthenticationRegisterHandler,
  AuthenticationLoginHandler,
  AuthenticationLogoutHandler,
  ForgotPasswordHandler,
  UpdatePasswordHandler,
  GetInTouchHandler,
  SwitchStoreHandler,
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
  imports: [
    CqrsModule,
    ScheduleModule.forRoot(),
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
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
      provide: 'ICustomerAdapter',
      useClass: CustomerAdapter,
    },
    {
      provide: 'IStoreAdapter',
      useClass: StoreAdapter,
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
    AuthenticationGuard,
    AuthorizationGuard,
    PermissionService,
    JwtStrategy,
    TenantOnboardingService,
    CustomerOnboardingService,
    { provide: 'ITenantOnboarding', useClass: TenantOnboardingAdapter },
    { provide: 'ICustomerOnboarding', useClass: CustomerOnboardingAdapter },
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    ...EmailBuilders,
    ...RateLimiters,
    ...CronServices,
    {
      provide: APP_GUARD,
      useExisting: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: AuthorizationGuard,
    },
  ],
  exports: [AuthenticationGuard, AuthorizationGuard, JwtModule],
})
export class AuthenticationDomain {}
