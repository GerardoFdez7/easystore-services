import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { PaymentGatewayService } from '../../application/services/payment-gateway.service';
import {
  InitiatePaymentParams,
  CompletePaymentParams,
  PaymentResult,
} from '../../aggregates/entities/provider/payment-provider.interface';
import {
  InitiatePaymentInput,
  PaymentResultOutput,
} from './types/payment.types';

@Resolver()
export class PaymentGatewayResolver {
  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  @Mutation(() => PaymentResultOutput)
  async initiatePayment(
    @Args('input') input: InitiatePaymentInput,
  ): Promise<PaymentResultOutput> {
    let customParams: Record<string, unknown> = {};

    // Handle VisaNet card information
    if (input.providerType === 'VISANET' && input.visanetCard) {
      customParams = {
        cardNumber: input.visanetCard.cardNumber,
        expirationDate: input.visanetCard.expirationDate,
        cvv: input.visanetCard.cvv,
        capture: input.visanetCard.capture,
        firstName: input.visanetCard.firstName,
        lastName: input.visanetCard.lastName,
        email: input.visanetCard.email,
        address: input.visanetCard.address,
        city: input.visanetCard.city,
        state: input.visanetCard.state,
        postalCode: input.visanetCard.postalCode,
        country: input.visanetCard.country,
        phoneNumber: input.visanetCard.phoneNumber,
      };
    } else if (input.customParams) {
      // Fallback to existing customParams parsing
      customParams = JSON.parse(input.customParams) as Record<string, unknown>;
    }

    const params: InitiatePaymentParams = {
      amount: input.amount,
      currency: input.currency,
      orderId: input.orderId,
      details: input.details,
      customParams,
      allowPendingPayments: input.allowPendingPayments,
      externalReferenceNumber: input.externalReferenceNumber,
    };

    const result: PaymentResult =
      await this.paymentGatewayService.initiatePayment(
        input.tenantId,
        input.providerType,
        params,
      );

    // Extract additional information from raw response for VisaNet
    let correlationId: string | undefined;
    let status: string | undefined;
    let environment: string | undefined;

    if (result.raw && typeof result.raw === 'object' && result.raw !== null) {
      const rawData = result.raw as {
        correlationId?: string;
        status?: string;
        environment?: string;
      };
      correlationId = rawData.correlationId;
      status = rawData.status;
      environment = rawData.environment;
    }

    return {
      success: result.success,
      transactionId: result.transactionId,
      checkoutUrl: result.checkoutUrl,
      error: result.error,
      correlationId,
      status,
      environment,
    };
  }

  @Mutation(() => PaymentResultOutput)
  async completePayment(
    @Args('tenantId') tenantId: string,
    @Args('providerType') providerType: string,
    @Args('paymentId') paymentId: string,
  ): Promise<PaymentResultOutput> {
    const params: CompletePaymentParams = { paymentId };
    const result: PaymentResult =
      await this.paymentGatewayService.completePayment(
        tenantId,
        providerType,
        params,
      );

    // Extract additional information from raw response for VisaNet
    let correlationId: string | undefined;
    let status: string | undefined;
    let environment: string | undefined;

    if (result.raw && typeof result.raw === 'object' && result.raw !== null) {
      const rawData = result.raw as {
        correlationId?: string;
        status?: string;
        environment?: string;
      };
      correlationId = rawData.correlationId;
      status = rawData.status;
      environment = rawData.environment;
    }

    return {
      success: result.success,
      transactionId: result.transactionId,
      checkoutUrl: result.checkoutUrl,
      error: result.error,
      correlationId,
      status,
      environment,
    };
  }

  @Mutation(() => PaymentResultOutput)
  async refundPayment(
    @Args('tenantId') tenantId: string,
    @Args('providerType') providerType: string,
    @Args('paymentId') paymentId: string,
    @Args('amount', { nullable: true }) amount?: number,
  ): Promise<PaymentResultOutput> {
    const params = { paymentId, amount };
    const result: PaymentResult =
      (await this.paymentGatewayService.refundPayment?.(
        tenantId,
        providerType,
        params,
      )) || { success: false, error: 'Refund not supported for this provider' };

    // Extract additional information from raw response for VisaNet
    let correlationId: string | undefined;
    let status: string | undefined;
    let environment: string | undefined;

    if (result.raw && typeof result.raw === 'object' && result.raw !== null) {
      const rawData = result.raw as {
        correlationId?: string;
        status?: string;
        environment?: string;
      };
      correlationId = rawData.correlationId;
      status = rawData.status;
      environment = rawData.environment;
    }

    return {
      success: result.success,
      transactionId: result.transactionId,
      checkoutUrl: result.checkoutUrl,
      error: result.error,
      correlationId,
      status,
      environment,
    };
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
