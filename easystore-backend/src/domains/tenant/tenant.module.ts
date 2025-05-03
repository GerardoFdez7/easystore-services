import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgreModule } from '@database/postgre/postgre.module';
import { LoggerModule } from '@shared/winston/winston.module';
import { TenantResolver } from './presentation/graphql/tenant.resolver';
import { TenantPostgreRepository } from './infrastructure/persistence/postgre/tenant.postgre';
import { FindTenantByBusinessNameHandler } from './aplication/queries/get-businessname/businessname.handler';
import { FindTenantByEmailHandler } from './aplication/queries/get-email/email.handler';
import { LoginTenantHandler } from './aplication/queries/login/login.handler';
import { TenantSingUpHandler } from './aplication/commands/create/sing-up.handler';
import { TenantCreatedHandler } from './aplication/events/tenant-created.handler';

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
    TenantPostgreRepository,
    {
      provide: 'TenantRepository',
      useClass: TenantPostgreRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class TenantModule {}
