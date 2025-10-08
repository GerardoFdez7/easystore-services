import { Injectable, Inject } from '@nestjs/common';
import { PaymentRepository } from '../../../aggregates/repositories/payment.repository.interface';
import { PaymentProviderFactoryService } from '../../services/payment-provider-factory.service';
import { InitiatePaymentDto } from './initiate-payment.dto';
import { PaymentEntity } from '../../../aggregates/entities/payment/payment.entity';
import { PaymentStatusEnum } from '../../../aggregates/value-objects/payment/payment-status.vo';
import { EventBus } from '@nestjs/cqrs';

export interface InitiatePaymentResult {
  paymentId: string;
  status: PaymentStatusEnum;
  transactionId?: string;
  providerResponse?: Record<string, unknown>;
  error?: string;
}

@Injectable()
export class InitiatePaymentHandler {
  constructor(
    @Inject('PAYMENT_REPOSITORY')
    private readonly paymentRepository: PaymentRepository,
    private readonly providerFactory: PaymentProviderFactoryService,
    private readonly eventBus: EventBus,
  ) {}

  async handle(dto: InitiatePaymentDto): Promise<InitiatePaymentResult> {
    try {
      // Create payment entity
      const payment = PaymentEntity.create({
        tenantId: dto.tenantId,
        providerType: dto.providerTypeVO,
        amount: dto.amountVO,
        currency: dto.currencyVO,
        orderId: dto.orderId,
        externalReferenceNumber: dto.externalReferenceNumber,
        metadata: {
          details: dto.details,
          customParams: dto.customParams,
          allowPendingPayments: dto.allowPendingPayments,
        },
      });

      // Save payment to repository
      await this.paymentRepository.save(payment);

      // Start processing
      payment.startProcessing();
      await this.paymentRepository.save(payment);

      // Get provider and initiate payment
      const provider = await this.providerFactory.getProvider(
        dto.tenantId,
        dto.providerType,
      );

      const providerResult = await provider.initiatePayment({
        amount: dto.amount,
        currency: dto.currency,
        orderId: dto.orderId,
        details: dto.details as unknown as Array<{
          quantity: number;
          description: string;
          price: number;
          urlProduct?: string;
        }>,
        customParams: dto.customParams,
        allowPendingPayments: dto.allowPendingPayments,
        externalReferenceNumber: dto.externalReferenceNumber,
      });

      // Update payment based on provider result
      if (providerResult.success) {
        payment.complete(providerResult.transactionId || payment.id.value, {
          providerResponse: providerResult.raw,
        });
      } else {
        payment.fail(providerResult.error || 'Payment processing failed', {
          providerResponse: providerResult.raw,
        });
      }

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
        transactionId: payment.transactionId,
        providerResponse: providerResult.raw as Record<string, unknown>,
        error: providerResult.success ? undefined : providerResult.error,
      };
    } catch (error) {
      return {
        paymentId: '',
        status: PaymentStatusEnum.FAILED,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
