import { Module } from '@nestjs/common';
import { PaymentGatewayService } from './application/services/payment-gateway.service';
import { PaymentProviderFactoryService } from './application/services/payment-provider-factory.service';
import { PagaditoService } from './application/services/pagadito.service';
import { InitiatePaymentHandler } from './application/commands/create/initiate-payment.handler';
import { CompletePaymentHandler } from './application/commands/complete/complete-payment.handler';
import { PaymentGatewayResolver } from './presentation/graphql/payment-gateway.resolver';
import { PaymentProviderCredentialPostgresRepository } from './infrastructure/persistence/postgres/payment-provider-credential.repository';

@Module({
  imports: [],
  providers: [
    PaymentGatewayService,
    PaymentProviderFactoryService,
    PagaditoService,
    InitiatePaymentHandler,
    CompletePaymentHandler,
    PaymentGatewayResolver,
    PaymentProviderCredentialPostgresRepository,
  ],
  exports: [PaymentGatewayService, PaymentProviderFactoryService],
})
export class PaymentGatewayModule {}
