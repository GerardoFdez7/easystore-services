import { Injectable, Inject, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaymentRepository } from '../../../aggregates/repositories/payment.repository.interface';
import { PaymentIdVO } from '../../../aggregates/value-objects/payment/payment-id.vo';
import { GetPaymentDto } from './get-payment.dto';
import { PaymentEntity } from '../../../aggregates/entities/payment/payment.entity';

@QueryHandler(GetPaymentDto)
@Injectable()
export class GetPaymentHandler implements IQueryHandler<GetPaymentDto> {
  private readonly logger = new Logger(GetPaymentHandler.name);

  constructor(
    @Inject('PAYMENT_REPOSITORY')
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(dto: GetPaymentDto): Promise<PaymentEntity | null> {
    this.logger.log(
      `Getting payment: ${dto.paymentId} for tenant: ${dto.tenantId}`,
    );
    const paymentId = new PaymentIdVO(dto.paymentId);
    const payment = await this.paymentRepository.findById(paymentId);

    this.logger.log(`Payment found: ${payment ? 'YES' : 'NO'}`);
    if (!payment) {
      this.logger.warn(`Payment not found: ${dto.paymentId}`);
      return null;
    }

    this.logger.log(
      `Payment tenantId: ${payment.tenantId}, requested tenantId: ${dto.tenantId}`,
    );
    // Ensure the payment belongs to the requesting tenant
    if (payment.tenantId !== dto.tenantId) {
      this.logger.warn(`Payment access denied for tenant: ${dto.tenantId}`);
      throw new Error('Payment not found or access denied');
    }

    this.logger.log(`Payment retrieved successfully: ${dto.paymentId}`);
    return payment;
  }
}
