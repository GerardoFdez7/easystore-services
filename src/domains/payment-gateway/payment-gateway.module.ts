import { Module } from '@nestjs/common';
import { PaymentGatewayService } from './application/services/payment-gateway.service';
import { PaymentProviderFactoryService } from './application/services/payment-provider-factory.service';
import { PagaditoService } from './infrastructure/providers/pagadito/pagadito.service';
import { InitiatePaymentHandler } from './application/commands/create/initiate-payment.handler';
import { CompletePaymentHandler } from './application/commands/complete/complete-payment.handler';
import { PaymentGatewayResolver } from './presentation/graphql/payment-gateway.resolver';
import { PaymentProviderCredentialRepository } from './aggregates/repositories/payment-provider-credential.interface';

@Module({
  imports: [
    // Add imports here (e.g., infrastructure, application modules)
  ],
  providers: [
    PaymentGatewayService,
    PaymentProviderFactoryService,
    PagaditoService,
    InitiatePaymentHandler,
    CompletePaymentHandler,
    PaymentGatewayResolver,
    PaymentProviderCredentialRepository,
  ],
  exports: [
    PaymentGatewayService,
    PaymentProviderFactoryService,
  ],
})
export class PaymentGatewayModule {}
