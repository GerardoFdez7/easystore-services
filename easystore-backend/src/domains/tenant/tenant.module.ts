import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgreModule } from '@database/postgre/postgre.module';
import { LoggerModule } from '@shared/winston/winston.module';
import { TenantResolver } from './presentation/graphql/tenant.resolver';
import { TenantRepository } from './infrastructure/persistence/postgre/tenant.repository';
import { FindTenantByBusinessNameHandler } from './application/queries/get-businessname/businessname.handler';
import { FindTenantByEmailHandler } from './application/queries/get-email/email.handler';
import { LoginTenantHandler } from './application/queries/login/login.handler';
import { TenantSingUpHandler } from './application/commands/create/sing-up.handler';
import { TenantCreatedHandler } from './application/events/tenant-created.handler';

// Command handlers
const CommandHandlers = [TenantSingUpHandler];

// Query handlers
const QueryHandlers = [
  FindTenantByEmailHandler,
  FindTenantByBusinessNameHandler,
  LoginTenantHandler,
];

// Event handlers
const EventHandlers = [TenantCreatedHandler];

@Module({
  imports: [CqrsModule, PostgreModule, LoggerModule],
  providers: [
    TenantResolver,
    TenantRepository,
    {
      provide: 'TenantRepository',
      useClass: TenantRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class TenantModule {}
