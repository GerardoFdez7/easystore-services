import { Injectable, Inject } from '@nestjs/common';
import { PaymentRepository } from '../../../aggregates/repositories/payment.repository.interface';
import { PaymentProviderFactoryService } from '../../services/payment-provider-factory.service';
import { RefundPaymentDto } from './refund-payment.dto';
import { PaymentIdVO } from '../../../aggregates/value-objects/payment/payment-id.vo';
import { PaymentStatusEnum } from '../../../aggregates/value-objects/payment/payment-status.vo';
import { EventBus } from '@nestjs/cqrs';

export interface RefundPaymentResult {
  paymentId: string;
  status: PaymentStatusEnum;
  refundAmount: number;
  isPartialRefund: boolean;
  providerResponse?: Record<string, unknown>;
  error?: string;
}

@Injectable()
export class RefundPaymentHandler {
  constructor(
    @Inject('PAYMENT_REPOSITORY')
    private readonly paymentRepository: PaymentRepository,
    private readonly providerFactory: PaymentProviderFactoryService,
    private readonly eventBus: EventBus,
  ) {}

  async handle(dto: RefundPaymentDto): Promise<RefundPaymentResult> {
    try {
      const paymentId = new PaymentIdVO(dto.paymentId);
      const payment = await this.paymentRepository.findById(paymentId);

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Ensure the payment belongs to the requesting tenant
      if (payment.tenantId !== dto.tenantId) {
        throw new Error('Payment not found or access denied');
      }

      // Check if payment can be refunded
      if (!payment.status.canBeRefunded) {
        throw new Error(
          `Payment cannot be refunded in status: ${payment.status.value}`,
        );
      }

      const refundAmount = dto.amountVO || payment.amount;
      const isPartialRefund = refundAmount.value < payment.amount.value;

      // Get provider and process refund
      const provider = await this.providerFactory.getProvider(
        dto.tenantId,
        payment.providerType.value,
      );

      if (!provider.refundPayment) {
        throw new Error('Refund not supported for this provider');
      }

      const providerResult = await provider.refundPayment({
        paymentId: payment.id.value,
        transactionId: payment.transactionId,
        amount: refundAmount.value,
        currency: payment.currency.value,
        reason: dto.reason,
      });

      if (providerResult.success) {
        // Update payment status
        payment.refund(refundAmount, dto.reason);
        await this.paymentRepository.save(payment);

        // Publish domain events
        const events = payment.getUncommittedEvents();
        for (const event of events) {
          await this.eventBus.publish(event);
        }
        payment.markEventsAsCommitted();

        return {
          paymentId: payment.id.value,
          status: payment.status.value,
          refundAmount: refundAmount.value,
          isPartialRefund,
          providerResponse: providerResult.raw as Record<string, unknown>,
        };
      } else {
        throw new Error(providerResult.error || 'Refund processing failed');
      }
    } catch (error) {
      return {
        paymentId: dto.paymentId,
        status: PaymentStatusEnum.FAILED,
        refundAmount: 0,
        isPartialRefund: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
