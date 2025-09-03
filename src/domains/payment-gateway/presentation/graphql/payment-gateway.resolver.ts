import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { PaymentGatewayService } from '../../application/services/payment-gateway.service';
import {
  InitiatePaymentParams,
  CompletePaymentParams,
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
    @Args('details', { nullable: true }) details?: string,
    @Args('customParams', { nullable: true }) customParams?: string,
    @Args('allowPendingPayments', { nullable: true })
    allowPendingPayments?: boolean,
    @Args('externalReferenceNumber', { nullable: true })
    externalReferenceNumber?: string,
  ): Promise<string> {
    const params: InitiatePaymentParams = {
      amount,
      currency,
      orderId,
      details: details
        ? (JSON.parse(details) as Array<{
            quantity: number;
            description: string;
            price: number;
            urlProduct?: string;
          }>)
        : undefined,
      customParams: customParams
        ? (JSON.parse(customParams) as Record<string, unknown>)
        : undefined,
      allowPendingPayments,
      externalReferenceNumber,
    };

    const result: PaymentResult =
      await this.paymentGatewayService.initiatePayment(
        tenantId,
        providerType,
        params,
      );

    if (!result.success) throw new Error(result.error || 'Payment failed');
    return result.checkoutUrl || result.transactionId || 'OK';
  }

  @Mutation(() => String)
  async completePayment(
    @Args('tenantId') tenantId: string,
    @Args('providerType') providerType: string,
    @Args('paymentId') paymentId: string,
  ): Promise<string> {
    const params: CompletePaymentParams = { paymentId };
    const result: PaymentResult =
      await this.paymentGatewayService.completePayment(
        tenantId,
        providerType,
        params,
      );

    if (!result.success)
      throw new Error(result.error || 'Payment completion failed');
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
