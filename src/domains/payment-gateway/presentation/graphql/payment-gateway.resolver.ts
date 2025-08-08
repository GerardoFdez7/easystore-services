import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { PaymentGatewayService } from '../../application/services/payment-gateway.service';
import {
  InitiatePaymentParams,
  PaymentResult,
} from '../../aggregates/entities/provider/payment-provider.interface';

@Resolver()
export class PaymentGatewayResolver {
  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  @Mutation(() => String)
  async initiatePayment(
    @Args('tenantId') tenantId: string,
    @Args('providerType') providerType: string,
    @Args('amount') amount: number,
    @Args('currency') currency: string,
    @Args('orderId') orderId: string,
  ): Promise<string> {
    const params: InitiatePaymentParams = { amount, currency, orderId };
    const result: PaymentResult =
      await this.paymentGatewayService.initiatePayment(
        tenantId,
        providerType,
        params,
      );
    if (!result.success) throw new Error(result.error || 'Payment failed');
    return result.transactionId || 'OK';
  }

  @Mutation(() => Boolean)
  async saveOrUpdateProviderKeys(
    @Args('tenantId') tenantId: string,
    @Args('providerType') providerType: string,
    @Args('credentials') credentials: string, // Pass as JSON string
  ): Promise<boolean> {
    await this.paymentGatewayService.saveOrUpdateProviderKeys(
      tenantId,
      providerType,
      JSON.parse(credentials) as Record<string, unknown>,
    );
    return true;
  }
}
