import { Injectable, Inject } from '@nestjs/common';
import { PaymentRepository } from '../../../aggregates/repositories/payment.repository.interface';
import { PaymentIdVO } from '../../../aggregates/value-objects/payment/payment-id.vo';
import { GetPaymentDto } from './get-payment.dto';
import { PaymentEntity } from '../../../aggregates/entities/payment/payment.entity';

@Injectable()
export class GetPaymentHandler {
  constructor(
    @Inject('PAYMENT_REPOSITORY')
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async handle(dto: GetPaymentDto): Promise<PaymentEntity | null> {
    const paymentId = new PaymentIdVO(dto.paymentId);
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      return null;
    }

    // Ensure the payment belongs to the requesting tenant
    if (payment.tenantId !== dto.tenantId) {
      throw new Error('Payment not found or access denied');
    }

    return payment;
  }
}
