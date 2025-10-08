import { Module, forwardRef } from '@nestjs/common';
import { PaymentGatewayService } from './application/services/payment-gateway.service';
import { PaymentProviderFactoryService } from './application/services/payment-provider-factory.service';
import { PagaditoService } from './application/services/pagadito.service';
import { InitiatePaymentHandler } from './application/commands/create/initiate-payment.handler';
import { CompletePaymentHandler } from './application/commands/complete/complete-payment.handler';
import { PaymentGatewayResolver } from './presentation/graphql/payment-gateway.resolver';
import { TenantDomain } from '../tenant/tenant.module';

@Module({
  imports: [forwardRef(() => TenantDomain)],
  providers: [
    PaymentGatewayService,
    PaymentProviderFactoryService,
    PagaditoService,
    InitiatePaymentHandler,
    CompletePaymentHandler,
    PaymentGatewayResolver,
  ],
  exports: [PaymentGatewayService, PaymentProviderFactoryService],
})
export class PaymentGatewayModule {}
