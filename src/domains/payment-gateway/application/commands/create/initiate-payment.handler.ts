import { Injectable, Inject, Logger } from '@nestjs/common';
import { ICommandHandler, CommandHandler, EventBus } from '@nestjs/cqrs';
import { PaymentRepository } from '../../../aggregates/repositories/payment.repository.interface';
import { PaymentProviderFactoryService } from '../../services/payment-provider-factory.service';
import { InitiatePaymentDto } from './initiate-payment.dto';
import { PaymentEntity } from '../../../aggregates/entities/payment/payment.entity';
import { PaymentStatusEnum } from '../../../aggregates/value-objects/payment/payment-status.vo';

export interface InitiatePaymentResult {
  paymentId: string;
  status: PaymentStatusEnum;
  transactionId?: string;
  providerResponse?: Record<string, unknown>;
  error?: string;
}

@CommandHandler(InitiatePaymentDto)
@Injectable()
export class InitiatePaymentHandler
  implements ICommandHandler<InitiatePaymentDto>
{
  private readonly logger = new Logger(InitiatePaymentHandler.name);
  constructor(
    @Inject('PAYMENT_REPOSITORY')
    private readonly paymentRepository: PaymentRepository,
    private readonly providerFactory: PaymentProviderFactoryService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(dto: InitiatePaymentDto): Promise<InitiatePaymentResult> {
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
      this.logger.log(`Saving payment to repository: ${payment.id.value}`);
      await this.paymentRepository.save(payment);

      // Start processing
      payment.startProcessing();
      this.logger.log(`Saving payment after processing: ${payment.id.value}`);
      await this.paymentRepository.save(payment);

      // Get provider and initiate payment
      const provider = await this.providerFactory.getProvider(
        dto.tenantId,
        dto.providerType,
      );

      const providerResult = await provider.initiatePayment({
        paymentId: payment.id.value,
        tenantId: dto.tenantId,
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

      this.logger.log(
        `Saving payment after provider result: ${payment.id.value}`,
      );
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
