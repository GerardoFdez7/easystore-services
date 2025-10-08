import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgresModule } from '../../infrastructure/database/postgres.module';

// Command Handlers
import {
  TenantSingUpHandler,
  UpdateTenantHandler,
  CreatePaymentCredentialsHandler,
  UpdatePaymentCredentialsHandler,
  DeletePaymentCredentialsHandler,
} from './application/commands';
// Query Handlers
import {
  GetTenantByIdHandler,
  GetPaymentCredentialsHandler,
} from './application/queries';
// Event Handlers
import {
  TenantCreatedHandler,
  TenantUpdatedHandler,
  IdentityCreatedHandler,
} from './application/events';
import TenantRepository from './infrastructure/persistence/postgres/tenant.repository';
import { PaymentCredentialsPostgresRepository } from './infrastructure/persistence/postgres/payment-credentials.repository';
import { CredentialsEncryptionService } from './infrastructure/encryption/credentials-encryption.service';
import { PaymentCredentialsService } from './application/services/payment-credentials.service';
import TenantResolver from './presentation/graphql/tenant.resolver';
import { PaymentCredentialsResolver } from './presentation/graphql/payment-credentials.resolver';

// Command handlers
const CommandHandlers = [
  TenantSingUpHandler,
  UpdateTenantHandler,
  CreatePaymentCredentialsHandler,
  UpdatePaymentCredentialsHandler,
  DeletePaymentCredentialsHandler,
];

// Query handlers
const QueryHandlers = [GetTenantByIdHandler, GetPaymentCredentialsHandler];

// Event handlers
const EventHandlers = [
  IdentityCreatedHandler,
  TenantCreatedHandler,
  TenantUpdatedHandler,
];

@Module({
  imports: [CqrsModule, PostgresModule],
  providers: [
    {
      provide: 'ITenantRepository',
      useClass: TenantRepository,
    },
    {
      provide: 'PaymentCredentialsRepository',
      useClass: PaymentCredentialsPostgresRepository,
    },
    CredentialsEncryptionService,
    PaymentCredentialsService,
    TenantResolver,
    PaymentCredentialsResolver,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [PaymentCredentialsService, CredentialsEncryptionService],
})
export class TenantDomain {}
