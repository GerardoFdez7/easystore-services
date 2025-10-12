import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentGatewayService } from './application/services/payment-gateway.service';
import { PaymentProviderFactoryService } from './application/services/payment-provider-factory.service';
import { PagaditoService } from './application/services/pagadito.service';
import { PaymentPostgresRepository } from './infrastructure/persistence/postgres/payment.repository';
import { PaymentGatewayResolver } from './presentation/graphql/payment-gateway.resolver';
import { PaymentProviderLoggerService } from './infrastructure/logging/payment-provider-logger.service';
import { TenantDomain } from '../tenant/tenant.module';

// Commands
import { InitiatePaymentHandler } from './application/commands/create/initiate-payment.handler';
import { CompletePaymentHandler } from './application/commands/complete/complete-payment.handler';
import { RefundPaymentHandler } from './application/commands/refund/refund-payment.handler';
// Queries
import { GetPaymentHandler } from './application/queries/get-payment/get-payment.handler';
import { ListPaymentsHandler } from './application/queries/list-payments/list-payments.handler';

// Events
import { PaymentInitiatedHandler } from './application/events/payment-initiated.handler';
import { PaymentCompletedHandler } from './application/events/payment-completed.handler';
import { PaymentFailedHandler } from './application/events/payment-failed.handler';
import { PaymentRefundedHandler } from './application/events/payment-refunded.handler';

const CommandHandlers = [
  InitiatePaymentHandler,
  CompletePaymentHandler,
  RefundPaymentHandler,
];

const QueryHandlers = [GetPaymentHandler, ListPaymentsHandler];

const EventHandlers = [
  PaymentInitiatedHandler,
  PaymentCompletedHandler,
  PaymentFailedHandler,
  PaymentRefundedHandler,
];

@Module({
  imports: [CqrsModule, forwardRef(() => TenantDomain)],
  providers: [
    // Services
    PaymentGatewayService,
    PaymentProviderFactoryService,
    PagaditoService,

    // Repository
    {
      provide: 'PAYMENT_REPOSITORY',
      useClass: PaymentPostgresRepository,
    },

    // CQRS Handlers
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,

    // GraphQL Resolver
    PaymentGatewayResolver,

    // Logging Service
    PaymentProviderLoggerService,
  ],
  exports: [
    PaymentGatewayService,
    PaymentProviderFactoryService,
    'PAYMENT_REPOSITORY',
    PaymentProviderLoggerService,
  ],
})
export class PaymentGatewayModule {}
