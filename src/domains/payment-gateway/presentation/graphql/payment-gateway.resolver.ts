import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { PaymentGatewayService } from '../../application/services/payment-gateway.service';
import {
  CompletePaymentParams,
  PaymentResult,
} from '../../aggregates/entities/provider/payment-provider.interface';
import {
  InitiatePaymentInput,
  PaymentResultOutput,
} from './types/payment.types';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { GetPaymentDto } from '../../application/queries/get-payment/get-payment.dto';
import { ListPaymentsDto } from '../../application/queries/list-payments/list-payments.dto';
import { InitiatePaymentDto } from '../../application/commands/create/initiate-payment.dto';

@Resolver()
export class PaymentGatewayResolver {
  constructor(
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Mutation(() => PaymentResultOutput)
  async initiatePayment(
    @Args('input') input: InitiatePaymentInput,
  ): Promise<PaymentResultOutput> {
    let customParams: Record<string, unknown> = {};

    // Handle card information (agnostic to provider)
    if (input.card) {
      customParams = {
        cardNumber: input.card.cardNumber,
        expirationDate: input.card.expirationDate,
        cvv: input.card.cvv,
        capture: input.card.capture,
        firstName: input.card.firstName,
        lastName: input.card.lastName,
        email: input.card.email,
        address: input.card.address,
        city: input.card.city,
        state: input.card.state,
        postalCode: input.card.postalCode,
        country: input.card.country,
        phoneNumber: input.card.phoneNumber,
      };
    } else if (input.customParams) {
      // Fallback to existing customParams parsing
      customParams = JSON.parse(input.customParams) as Record<string, unknown>;
    }

    const dto = new InitiatePaymentDto(
      input.tenantId,
      input.providerType,
      input.amount,
      input.currency,
      input.orderId,
      input.externalReferenceNumber,
      input.details as unknown as Record<string, unknown>,
      customParams,
      input.allowPendingPayments,
    );

    const rawResult = (await this.commandBus.execute(dto)) as unknown;

    // Type guard to ensure we have the expected structure
    const isInitiatePaymentResult = (
      obj: unknown,
    ): obj is {
      paymentId: string;
      status: string;
      transactionId?: string;
      providerResponse?: Record<string, unknown>;
      error?: string;
    } => {
      return (
        typeof obj === 'object' &&
        obj !== null &&
        'paymentId' in obj &&
        'status' in obj &&
        typeof (obj as { paymentId: unknown }).paymentId === 'string' &&
        typeof (obj as { status: unknown }).status === 'string'
      );
    };

    if (!isInitiatePaymentResult(rawResult)) {
      return {
        success: false,
        error: 'Invalid payment initiation result',
      };
    }

    const result = rawResult;

    // Extract additional information from provider response for VisaNet
    let correlationId: string | undefined;
    let status: string | undefined;
    let environment: string | undefined;

    if (
      result.providerResponse &&
      typeof result.providerResponse === 'object' &&
      result.providerResponse !== null
    ) {
      const rawData = result.providerResponse as {
        correlationId?: string;
        status?: string;
        environment?: string;
      };
      correlationId = rawData.correlationId;
      status = rawData.status;
      environment = rawData.environment;
    }

    return {
      success: !result.error,
      transactionId: result.transactionId,
      checkoutUrl: undefined, // Will be set by provider
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
    const params = { paymentId, transactionId: '', amount };
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

  @Query(() => String, { nullable: true })
  async getPayment(
    @Args('tenantId') tenantId: string,
    @Args('paymentId') paymentId: string,
  ): Promise<string | null> {
    const dto = new GetPaymentDto(tenantId, paymentId);
    const result = (await this.queryBus.execute(dto)) as unknown;
    return result ? JSON.stringify(result) : null;
  }

  @Query(() => String, { nullable: true })
  async listPayments(
    @Args('tenantId') tenantId: string,
    @Args('limit', { nullable: true }) limit?: number,
    @Args('offset', { nullable: true }) offset?: number,
  ): Promise<string | null> {
    const page = offset ? Math.floor(offset / (limit || 20)) + 1 : 1;
    const pageLimit = limit || 20;

    const dto = new ListPaymentsDto(
      tenantId,
      undefined,
      undefined,
      undefined,
      page,
      pageLimit,
    );
    const result = (await this.queryBus.execute(dto)) as unknown as Record<
      string,
      unknown
    >;
    return result ? JSON.stringify(result) : null;
  }
}
